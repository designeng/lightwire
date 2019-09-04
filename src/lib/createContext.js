import { map, forEach, keys, intersection, reduce, assign, flatten, clone, isFunction, isArray, isObject, isNil } from 'lodash';
import when from 'when';
import sequence from 'when/sequence';
import meld from 'meld';

import ComponentModule from './ComponentModule';

const Promise = when.promise;

function isPromise(x) {
    return x instanceof Promise;
}

export const NOT_VALID_SPEC_ERROR_MESSAGE = 'Specification in createContext should be object or array of objects';
export const HEAD = '____HEAD____';

import Graph from '../graph/Graph';
import GraphVertex from '../graph/GraphVertex';
import GraphEdge from '../graph/GraphEdge';

import depthFirstSearch from '../graph/algorithms/depthFirstSearch';
import detectDirectedCycle from '../graph/algorithms/detectDirectedCycle';

const DOT = '.';

const RESERVED_NAMES = [HEAD, 'destroy'];

export function isRef(arg) {
    return arg && arg.hasOwnProperty('$ref');
}

function NotValidSpecError(message) {
    this.constructor.prototype.__proto__ = Error.prototype;
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.code = 500;
}

function ReservedNameError(message) {
    this.constructor.prototype.__proto__ = Error.prototype;
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.code = 500;
}

function NotDefinedComponentError(message) {
    this.constructor.prototype.__proto__ = Error.prototype;
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.code = 500;
}

function CyclesDetectedError(message) {
    this.constructor.prototype.__proto__ = Error.prototype;
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.code = 500;
}

function ComponentInvocationError(message) {
    this.constructor.prototype.__proto__ = Error.prototype;
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.code = 500;
}

const getBaseInjectedObject = (arg) => {
    let arr = arg.$ref.split(DOT);
    return arr[0];
}

export function createReservedNameErrorMessage(name, specKeys) {
    let message = `Component with name '${name}' is reserved and not permitted`;
    if(specKeys && specKeys.length) message += `. Spec with components: ${specKeys}`;
    return message;
}

export function mergeSpecs(specs) {
    return reduce(specs, (res, spec) => {
        let sp = isArray(spec) ? mergeSpecs(spec) : spec;
        for(let component in sp) {
            assign(res, {[component]: sp[component]});
        }
        return res;
    }, {});
}

export default function createContext(originalSpec) {
    return Promise(function (resolve, reject) {
        const namesInResolvingOrder = [];
        const destroyers = [];
        let argumentsSubstitutions = {};

        /* merge specs if array provided */
        let mergedSpecs;
        if(isArray(originalSpec)) {
            forEach(originalSpec, spec => {
                RESERVED_NAMES.map(name => {
                    if(spec.hasOwnProperty(name)) {
                        reject(new ReservedNameError(createReservedNameErrorMessage(name, keys(spec))));
                    }
                });
            });
            mergedSpecs = mergeSpecs(originalSpec);
        } else if(!isObject(originalSpec)) {
            reject(new NotValidSpecError(NOT_VALID_SPEC_ERROR_MESSAGE));
        } else {
            RESERVED_NAMES.map(name => {
                if(originalSpec.hasOwnProperty(name)) {
                    reject(new ReservedNameError(createReservedNameErrorMessage(name, keys(originalSpec))));
                }
            });
        }

        let mergedSpecsKeys = keys(mergedSpecs);

        const spec = mergedSpecs ? mergedSpecs : clone(originalSpec);

        /* create additional vertex connected with all others */
        let componentNames = Object.keys(spec);
        let headArgs = map(componentNames, (name) => ({$ref: name}))

        const destroy = function() {
            for(let prop in this) {
                if(!isNil(this[prop]) && Object.getPrototypeOf(this[prop]) !== null && this[prop].hasOwnProperty('destroy')) {
                    when(this[prop].destroy()).then(() => delete this[prop])
                } else {
                    delete this[prop];
                }
            }

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

        const createOrGetVertex = (name) => {
            if(vertices[name]) {
                return vertices[name];
            } else {
                vertices[name] = new GraphVertex(name);
                return vertices[name];
            }
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
                    let name;
                    let refString = arg.$ref;

                    if(refString.indexOf(DOT) != -1) {
                        name = getBaseInjectedObject(arg);
                    } else {
                        name = refString;
                    }

                    if(!components.hasOwnProperty(name)) {
                        reject(new NotDefinedComponentError(`No component with name ${name}`));
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
            let promise;
            const promises = [];

            const leaveVertexCallback = (v) => {
                let { currentVertex } = v;
                let { value } = currentVertex;
                let name = value;

                let componentModule = new ComponentModule(components[name].module, argumentsSubstitutions);

                try {
                    promise = componentModule.invoke.apply(componentModule, components[name].args);
                } catch(error) {
                    reject(new ComponentInvocationError(error.message));
                }

                argumentsSubstitutions[name] = promise;
                namesInResolvingOrder.push(name);

                componentModule.destroy();

                promises.push(promise);
            }

            depthFirstSearch(digraph, vertices[HEAD], {
                leaveVertex: leaveVertexCallback,
            });

            resolve(when.reduce(promises, (res, resolved, index) => {
                assign(res, {
                    [namesInResolvingOrder[index]] : resolved
                })
                return res;
            }, {}).then(context => {
                return context[HEAD];
            }));
        } else {
            reject(new CyclesDetectedError('Cycles detected'));
        }
    });
}
