import createContext, { isRef } from '../lib/createContext';
import { isArray, reduce, assign, union } from 'lodash';

export default function defer(specs, ...provide) {
    return (target, name, description) => {
        const _specs = isArray(specs) ? specs : [specs]; /* normalize */
        return {
            value: {
                create: {
                    module: (...resolved) => {
                        let provideSpec = reduce(provide, (res, arg, index) => {
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
                    args: provide
                }
            }
        }
    }
}
