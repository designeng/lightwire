import polyfill from '@babel/polyfill';

import { map, forEach, reduce, assign, flatten } from 'lodash';
import when from 'when';
import meld from 'meld';

const Promise = when.promise;

import Graph from '../graph/Graph';
import GraphVertex from '../graph/GraphVertex';
import GraphEdge from '../graph/GraphEdge';
import depthFirstSearch from '../graph/algorithms/depthFirstSearch';

function isRef(arg) {
    return arg && arg.hasOwnProperty('$ref');
}

export default function createContext(spec) {
    let entries = Object.entries(spec);
    let vertices = {};
    let argumentsSubstitutions = {};

    const createOrGetVertex = (name) => {
        if(vertices[name]) {
            return vertices[name];
        } else {
            vertices[name] = new GraphVertex(name);
            vertices[name].method = spec[name].create.method;
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
        let { method, args } = componentDef.create;
        assign(res, {
            [name] : {
                method,
                args
            }
        });
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

    depthFirstSearch(digraph, vertices['a'], {
        leaveVertex: leaveVertexCallback,
    })

    return when.reduce(promises, (res, resolved, index) => {
        assign(res, {
            [namesInResolvingOrder[index]] : resolved
        })
        return res;
    }, {}).then(context => {
        console.log('Context created :::', context);
    }).catch(err => {
        console.log('ERROR', err);
    })
}
