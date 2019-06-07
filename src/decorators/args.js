import { map, reduce, isNil } from 'lodash';

export const NULL_OR_UNDEFINED_HAS_NO_PROPERTY = 'Injected object is null or undefined. Ref does not corresponds to injected object property';
const DOT = '.';
function isRef(arg) {
    return arg && arg.hasOwnProperty('$ref');
}

const getBaseInjectedObject = (arg) => {
    let arr = arg.$ref.split(DOT);
    return {$ref: arr[0]};;
}

const getInjectedObjectProp = (arg) => {
    let arr = arg.$ref.split(DOT);
    return arr[1];
}

export default function args(...args) {
    return (target, name, description) => {
        let func = target[name];
        let argsProps = {};

        let injectedArgs = map(args, (arg, index) => {
            if(isRef(arg) && arg.$ref.indexOf(DOT) != -1) {
                argsProps[index] = getInjectedObjectProp(arg);
                return getBaseInjectedObject(arg);
            } else {
                return arg;
            }
        });

        return {
            value: {
                create: {
                    module: (...resolved) => {
                        let resArgs = reduce(resolved, (res, arg, index) => {
                            if(argsProps[index]) {
                                if(isNil(arg)) throw new Error(NULL_OR_UNDEFINED_HAS_NO_PROPERTY);
                                res.push(arg[argsProps[index]]);
                            } else {
                                res.push(arg);
                            }
                            return res;
                        }, []);
                        return func.apply(null, resArgs);
                    },
                    args: injectedArgs
                }
            }
        }
    }
}
