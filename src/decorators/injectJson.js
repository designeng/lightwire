import createContext, { isRef } from '../lib/createContext';
import { isArray, reduce, assign, union } from 'lodash';
import when from 'when';

export const RESPONSE_NOT_FOUND = 'Response component not found in specs';

export default function injectJson(specs, ...provide) {
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
                        return when(createContext(mergedSpecs)).then(ctx => {
                            process.nextTick(() => ctx.destroy())
                            if(ctx.response) {
                                return ctx.response.json;
                            } else {
                                throw new Error(RESPONSE_NOT_FOUND);
                            }
                        });
                    },
                    args: provide
                }
            }
        }
    }
}
