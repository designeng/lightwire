import createContext, { isRef } from '../lib/createContext';
import { map, reduce, forEach, assign, union, isArray, isObject, isString } from 'lodash';

export default function defer(specs, ...provide) {
    return (target, name, description) => {
        const _specs = isArray(specs) ? specs : [specs]; /* normalize */
        const renamed = {};

        const realArgs = reduce(provide, (res, item, index) => {
            let entries = Object.entries(item);
            if(entries.length > 1) {
                forEach(entries, (entry, index) => {
                    let key = entries[index][0];
                    let name = entries[index][1];
                    if(key === '$ref' && isString(name)) {
                        res.push({$ref: name});
                    } else {
                        renamed[index] = key;
                        let _entries = Object.entries(name); /* name should be object here. TODO: test for $ref in _entries[0][0] */
                        res.push({$ref: _entries[0][1]});
                    }
                })
            } else if(entries.length === 1) {
                let key = entries[0][0];
                let name = entries[0][1];
                if(key === '$ref' && isString(name)) {
                    res.push({$ref: name});
                }
            } else {
                /* do nothing */
            }
            return res;
        }, []);

        return {
            value: {
                create: {
                    module: (...resolved) => {
                        let provideSpec = reduce(realArgs, (res, arg, index) => {
                            if(isRef(arg)) {
                                if(renamed[index]) {
                                    assign(res, { [renamed[index]]: resolved[index] })
                                } else {
                                    assign(res, { [arg.$ref]: resolved[index] })
                                }
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
