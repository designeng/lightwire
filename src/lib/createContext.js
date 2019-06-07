import { map, forEach, reduce, assign, flatten, clone, isFunction, isArray, isObject, isNil } from 'lodash';
import when from 'when';
import sequence from 'when/sequence';
import meld from 'meld';

const Promise = when.promise;

export const NOT_VALID_SPEC_ERROR_MESSAGE = 'Specification in createContext should be object or array of objects';
export const NULL_OR_UNDEFINED_HAS_NO_PROPERTY = 'Injected object is null or undefined. Ref does not corresponds to injected object property';
export const HEAD = '____HEAD____';

import Graph from '../graph/Graph';
import GraphVertex from '../graph/GraphVertex';
import GraphEdge from '../graph/GraphEdge';

import depthFirstSearch from '../graph/algorithms/depthFirstSearch';
import detectDirectedCycle from '../graph/algorithms/detectDirectedCycle';

export function isRef(arg) {
    return arg && arg.hasOwnProperty('$ref');
}

export function createReservedNameErrorMessage(name) {
    return `Component with name '${name}' is reserved and not permitted`
}

const getBaseInjectedObject = (arg) => {
    let arr = arg.$ref.split(DOT);
    return {$ref: arr[0]};;
}

const getInjectedObjectProp = (arg) => {
    let arr = arg.$ref.split(DOT);
    return arr[1];
}

export default function createContext(originalSpec) {
    const aopRemovers = [];
    const namesInResolvingOrder = [];
    const destroyers = [];

    /* merge specs if array provided */
    let mergedSpecs;
    if(isArray(originalSpec)) {
        mergedSpecs = reduce(originalSpec, (res, spec) => {
            for(let component in spec) {
                assign(res, {[component]: spec[component]});
            }
            return res;
        }, {});
    } else if(!isObject(originalSpec)) {
        throw new Error(NOT_VALID_SPEC_ERROR_MESSAGE);
    }

    [HEAD, 'destroy'].map(name => {
        if(originalSpec.hasOwnProperty(name)) {
            throw new Error(createReservedNameErrorMessage(name));
        }
    });

    const spec = mergedSpecs ? mergedSpecs : clone(originalSpec);

    /* create additional vertex connected with all others */
    let componentNames = Object.keys(spec);
    let headArgs = map(componentNames, (name) => ({$ref: name}))

    const destroy = function() {
        for(let prop in this) {
            if(!isNil(this[prop]) && this[prop].hasOwnProperty('destroy')) {
                when(this[prop].destroy()).then(() => delete this[prop])
            } else {
                delete this[prop];
            }
        }
        forEach(aopRemovers, (remover) => remover.remove());
        for (var i = 0; i < namesInResolvingOrder.length; i++) {
            delete namesInResolvingOrder[i];
        }
        return sequence(destroyers);
    }
    destroy.bind(spec);

    spec[HEAD] = {
        create: {
            module: (...resolvedArgs) => {
                return reduce(componentNames, (res, name, index) => {
                    assign(res, {
                        [name]: resolvedArgs[index]
                    });
                    assign(res, {
                        destroy
                    })
                    return res;
                }, {})
            },
            args: headArgs
        }
    }

    let entries = Object.entries(spec);
    let vertices = {};
    let argumentsSubstitutions = {};

    const createOrGetVertex = (name) => {
        if(vertices[name]) {
            return vertices[name];
        } else {
            vertices[name] = new GraphVertex(name);
            return vertices[name];
        }
    }

    const aroundOriginal = (joinpoint) => {
        let { args, proceed } = joinpoint;

        let argsProps = {};

        let injectedArgs = map(args, (arg, index) => {
            if(isRef(arg) && arg.$ref.indexOf(DOT) != -1) {
                argsProps[index] = getInjectedObjectProp(arg);
                return getBaseInjectedObject(arg);
            } else {
                return arg;
            }
        });

        let newArgs = flatten(args).map((arg) => {
            if(isRef(arg)) {
                return argumentsSubstitutions[arg.$ref];
            } else {
                return arg;
            }
        });

        return when.map(newArgs).then(resolved => {
            let resArgs = reduce(resolved, (res, arg, index) => {
                if(argsProps[index]) {
                    if(isNil(arg)) throw new Error(NULL_OR_UNDEFINED_HAS_NO_PROPERTY);
                    res.push(arg[argsProps[index]]);
                } else {
                    res.push(arg);
                }
                return res;
            }, []);

            proceed.apply(null, resArgs)
        });
    }

    let components = reduce(entries, (res, item) => {
        let [name, componentDef] = item;
        if(componentDef && componentDef.destroy && isFunction(componentDef.destroy)) {
            destroyers.push(componentDef.destroy);
        }
        if(componentDef && componentDef.create) {
            let { module, args } = componentDef.create;
            assign(res, {
                [name] : {
                    module,
                    args
                }
            });
        } else {
            assign(res, {
                [name] : {
                    module: () => spec[name]
                }
            });
        }
        return res;
    }, {});

    const digraph = new Graph(true);

    const addedKeys = {};

    forEach(components, (component, name) => {
        let { args } = component;
        let vertexFrom = createOrGetVertex(name);

        forEach(args, (arg, index) => {
            if(isRef(arg)) {
                let name = arg.$ref;
                if(!components.hasOwnProperty(name)) {
                    throw new Error(`No component with name ${name}`)
                }

                let vertexTo = createOrGetVertex(name);


                let edge = new GraphEdge(vertexFrom, vertexTo);
                let edgeKey = edge.getKey();
                if(!addedKeys[edgeKey]) {
                    digraph.addEdge(edge);
                    addedKeys[edgeKey] = 1;
                }
            }
        })
    });

    let cycles = detectDirectedCycle(digraph);
    if(!cycles) {
        const promises = [];

        const leaveVertexCallback = (v) => {
            let { currentVertex } = v;
            let { value } = currentVertex;
            let name = value;

            namesInResolvingOrder.push(name);

            let remover = meld.around(components[name], 'module', aroundOriginal);
            aopRemovers.push(remover);

            let originalArgs = components[name].args;
            argumentsSubstitutions[name] = components[name].module(originalArgs);

            promises.push(argumentsSubstitutions[name]);
        }

        depthFirstSearch(digraph, vertices[HEAD], {
            leaveVertex: leaveVertexCallback,
        })

        return when.reduce(promises, (res, resolved, index) => {
            assign(res, {
                [namesInResolvingOrder[index]] : resolved
            })
            return res;
        }, {}).then(context => {
            return context[HEAD];
        })
    } else {
        throw new Error('Cycles detected')
    }
}
