import createContext, { isRef, mergeSpecs } from '../lib/createContext';
import { map, reduce, forEach, assign, union, isArray, isObject, isString } from 'lodash';

export default function defer(specs, ...provide) {
    return (target, name, description) => {
        const _specs = isArray(specs) ? specs : [specs]; /* normalize */
        const customNames = new Map();

        let argsCount = 0;

        const realArgs = reduce(provide, (res, item) => {
            let entries = Object.entries(item);
            if(entries.length > 1) {
                forEach(entries, (entry, index) => {
                    let key = entries[index][0];
                    let t = entries[index][1];

                    if(key === '$ref' && isString(t)) {
                        res.push({$ref: t});
                        argsCount++;
                    } else {
                        customNames.set(argsCount, key);
                        if(isObject(t) && t.hasOwnProperty('$ref')) {
                            let _entries = Object.entries(t); /* name should be object here. TODO: test for $ref in _entries[0][0] */
                            res.push({$ref: _entries[0][1]});
                            argsCount++;
                        } else {
                            res.push(t);
                            argsCount++;
                        }
                    }
                })
            } else if(entries.length === 1) {
                let key = entries[0][0];
                let name = entries[0][1];
                if(key === '$ref' && isString(name)) {
                    res.push({$ref: name});
                    argsCount++;
                }
            } else {
                /* object is empty, do nothing */
            }
            return res;
        }, []);

        return {
            value: {
                create: {
                    module: (...resolved) => {
                        let provideSpec = reduce(realArgs, (res, arg, index) => {
                            let customName = customNames.get(index);
                            if(isRef(arg)) {
                                if(customName) {
                                    assign(res, { [customName]: resolved[index] })
                                } else {
                                    assign(res, { [arg.$ref]: resolved[index] })
                                }
                            } else {
                                assign(res, { [customName]: resolved[index] })
                            }
                            return res;
                        }, {});
                        let mergedSpecs = _specs.concat(provideSpec);

                        const callback = (spec) => {
                            let newSpecs = mergeSpecs(mergedSpecs, spec);
                            console.log('newSpecs......', newSpecs);
                            return createContext(newSpecs);
                        }
                        
                        return callback;
                    },
                    args: realArgs
                }
            }
        }
    }
}
