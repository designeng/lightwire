import createContext, { isRef } from '../lib/createContext';
import { map, reduce, assign, union, isArray, isObject, forIn } from 'lodash';

function traverseForRefs(obj, callback) {
    forIn(obj, function (val, key) {
        if (isArray(val)) {
            val.forEach(function(el) {
                if (isObject(el)) {
                    traverseForRefs(el, callback);
                }
            });
        } else if(isObject(val)) {
            traverseForRefs(val, callback);
        } else if (isObject(key)) {
            traverseForRefs(obj[key], callback);
        } else {
            if(key === '$ref') {
                let arg = {$ref: val}
                callback(arg);
            } else {
                /* TODO: simple value */
            }
        }
    });
}

export default function defer(specs, ...provide) {
    return (target, name, description) => {
        const _specs = isArray(specs) ? specs : [specs]; /* normalize */

        const realArgs = [];

        traverseForRefs(provide, (arg) => {
            realArgs.push(arg);
        });

        return {
            value: {
                create: {
                    module: (...resolved) => {
                        let provideSpec = reduce(realArgs, (res, arg, index) => {
                            if(isRef(arg)) {
                                assign(res, {
                                    [arg.$ref]: resolved[index]
                                })
                            }
                            return res;
                        }, {});
                        let mergedSpecs = _specs.concat(provideSpec);
                        const callback = () => createContext(mergedSpecs);
                        return callback;
                    },
                    args: realArgs
                }
            }
        }
    }
}
