import polyfill from '@babel/polyfill';

import { map, forEach, reduce, assign, flatten, clone } from 'lodash';
import when from 'when';
import meld from 'meld';

const Promise = when.promise;
export const HEAD = '____HEAD____';

import Graph from '../graph/Graph';
import GraphVertex from '../graph/GraphVertex';
import GraphEdge from '../graph/GraphEdge';

import depthFirstSearch from '../graph/algorithms/depthFirstSearch';
import detectDirectedCycle from '../graph/algorithms/detectDirectedCycle';

function isRef(arg) {
    return arg && arg.hasOwnProperty('$ref');
}

export function createReservedNameErrorMessage(name) {
    return `Component with name '${name}' is reserved and not permitted`
}

export default function createContext(originalSpec) {
    [HEAD, 'destroy'].map(name => {
        if(originalSpec.hasOwnProperty(name)) {
            throw new Error(createReservedNameErrorMessage(name));
        }
    });

    const spec = clone(originalSpec);

    /* create additional vertex connected with all others */
    let componentNames = Object.keys(spec);
    let headArgs = map(componentNames, (name) => ({$ref: name}))

    /* create destroy method (?) */
    const destroy = function() {
        for(let prop in this) {
            delete this[prop];
        }
    }
    destroy.bind(spec);

    spec[HEAD] = {
        create: {
            method: (...resolvedArgs) => {
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

    const aroundOriginalMethod = (joinpoint) => {
        let { args, proceed } = joinpoint;

        let newArgs = flatten(args).map((arg) => {
            if(isRef(arg)) {
                return argumentsSubstitutions[arg.$ref];
            } else {
                return arg;
            }
        });
        return when.map(newArgs).then(args => proceed.apply(null, args));
    }

    let components = reduce(entries, (res, item) => {
        let [name, componentDef] = item;
        if(componentDef.create) {
            let { method, args } = componentDef.create;
            assign(res, {
                [name] : {
                    method,
                    args
                }
            });
        } else {
            assign(res, {
                [name] : {
                    method: () => spec[name]
                }
            });
        }
        return res;
    }, {});

    const digraph = new Graph(true);

    forEach(components, (component, name) => {
        let { args } = component;
        let vertexFrom = createOrGetVertex(name);

        forEach(args, (arg, index) => {
            if(arg.hasOwnProperty('$ref')) {
                let vertexTo = createOrGetVertex(arg.$ref);
                digraph.addEdge(new GraphEdge(vertexFrom, vertexTo));
            }
        })
    });

    let cycles = detectDirectedCycle(digraph);
    if(!cycles) {
        const promises = [];
        const namesInResolvingOrder = [];

        const leaveVertexCallback = (v) => {
            let { currentVertex } = v;
            let { value } = currentVertex;
            let name = value;

            namesInResolvingOrder.push(name);

            meld.around(components[name], 'method', aroundOriginalMethod);

            let originalArgs = components[name].args;
            argumentsSubstitutions[name] = components[name].method(originalArgs);

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
