import polyfill from '@babel/polyfill';

import { map, forEach, reduce, assign, flatten, clone } from 'lodash';
import when from 'when';
import meld from 'meld';

const Promise = when.promise;
const HEAD = '____HEAD____';

import Graph from '../graph/Graph';
import GraphVertex from '../graph/GraphVertex';
import GraphEdge from '../graph/GraphEdge';

import depthFirstSearch from '../graph/algorithms/depthFirstSearch';
import detectDirectedCycle from '../graph/algorithms/detectDirectedCycle';

function isRef(arg) {
    return arg && arg.hasOwnProperty('$ref');
}

export default function createContext(originalSpec) {
    if(originalSpec.hasOwnProperty(HEAD)) {
        throw new Error(`Component with name ${HEAD} is reserved and not permitted`);
    }

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
            if(spec[name].create && spec[name].create.method) {
                vertices[name].method = spec[name].create.method;
            }
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

            if(currentVertex.hasOwnProperty('method')) {
                meld.around(components[name], 'method', aroundOriginalMethod);

                let originalArgs = components[name].args;
                argumentsSubstitutions[name] = components[name].method(originalArgs);

                promises.push(argumentsSubstitutions[name]);
            }
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
