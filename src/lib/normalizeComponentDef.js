import {
    isString,
    isObject,
    isArray,
    isFunction
} from 'lodash';

export default function normalizeComponentDef(def) {
    if((isObject(def) && !def.hasOwnProperty('create'))
        || (isObject(def) && def.hasOwnProperty('create') && !isFunction(def.create))
        || !isObject(def)) {
        return {
            create: {
                method: () => def
            }
        }
    } else {
        return def;
    }
}
