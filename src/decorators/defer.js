import createContext, { isRef } from '../lib/createContext';
import { reduce, assign, union } from 'lodash';

export default function defer(specs, ...provide) {
    return (target, name, description) => {
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
                        let mergedSpecs = specs.concat(provideSpec);
                        const callback = () => createContext(mergedSpecs);
                        return callback;
                    },
                    args: provide
                }
            }
        }
    }
}
