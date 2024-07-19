import when from 'when';
import meld from 'meld';
import { map, reduce, forEach, isObject, isString, isNil } from 'lodash';

const DOT = '.';

export function isRef(arg) {
    return arg && arg.hasOwnProperty('$ref') && isString(arg.$ref);
}

export function isComplexReference(arg) {
    return isRef(arg) && arg.$ref.indexOf(DOT) > 0;
}

/**
 * @param {Array} args - массив аргументов
 * @returns {Array} значение элемента массива null, если ссылка не сложная.
 В противном случае значение элемента равно строке-пути до искомого поля.
 Например, компонент a = {b: {c: 1}}. Полная ссылка: {$ref: 'a.b.c'}.
 Но в строке-пути оставляется только путь к вложенному полю относительно данного объекта,
 т.е. ссылка на сам объект (компонент) не нужна и в пути не хранится.
 */
export function getComplexReferences(args) {
    return map(args, arg => {
        if(isComplexReference(arg)) {
            let fragments = arg.$ref.split(DOT);
            fragments.shift(); /* здесь удаляем ссылку на сам компонент */
            return fragments.join(DOT);
        } else {
            return null;
        }
    })
}

export function getBaseComponentReference(arg) {
    let arr = arg.$ref.split(DOT);
    return arr[0];
}

/**
 * @param {Object} obj - исходный объект
 * @param {String} $ref - ссылка на поле внутри, возможно, вложенного объекта. Из ссылки уже удален первый фрагмент,
 соответствующий компоненту
 * @returns {Any} значение поля
 */
export function diveIntoObjectByReferenceAndGetReferenceValue(obj, $ref, baseRefs, index) {
    if(isNil(obj)) throw new Error(`Can not resolve $ref ${$ref}, ${baseRefs[index]} is null or undefided`);
    let fragments = $ref.split(DOT);
    return reduce(fragments, (res, fragment) => {
        if(res.hasOwnProperty(fragment)) {
            res = res[fragment];
            return res;
        } else {
            throw new Error(`Can not resolve $ref ${baseRefs[index]}.${$ref}`);
        }
    }, obj);
}

export function findArgInArgumentSubstitutions(argumentsSubstitutions, arg) {
    if(!isRef(arg)) {
        throw new TypeError(`Second argument is not a reference`);
    }

    let refString = arg.$ref;

    if(isComplexReference(arg)) {
        let fragments = refString.split(DOT);
        let firstFragment = fragments.shift();
        let length = fragments.length;
        if(length > 0) {
            if(argumentsSubstitutions.hasOwnProperty(firstFragment)) {
                let readyArg = reduce(fragments, (res, fragment) => {
                    if(res.hasOwnProperty(fragment)) {
                        res = res[fragment];
                        return res;
                    } else {
                        throw new Error(`Can not resolve $ref ${refString}`);
                    }
                }, argumentsSubstitutions[firstFragment]);
                return readyArg;
            } else {
                throw new Error(`Can not resolve $ref ${refString}`);
            }
        } else {
            if(argumentsSubstitutions.hasOwnProperty(firstFragment)) {
                return argumentsSubstitutions[firstFragment];
            } else {
                throw new Error(`Can not resolve $ref ${refString}`);
            }
        }
    } else {
        return argumentsSubstitutions[refString];
    }
}

export default class ComponentModule {

    /**
     * @param {Function} func
     * @param {Object} argumentsSubstitutions
     * @returns {ComponentModule}
     */
    constructor (func, argumentsSubstitutions) {
        this.func = func;
        this.argumentsSubstitutions = argumentsSubstitutions;

        this.removers = [];

        let remover = meld.around(this, 'invoke', this.aroundAspect);
    }

    aroundAspect(joinpoint) {
        let { args, proceed } = joinpoint;

        /* у нас есть готовые компоненты для подстановки? */
        let argumentsSubstitutions = this.argumentsSubstitutions;
        let baseRefs = {};
        let complexArgs = getComplexReferences(args);

        /* возможно, некоторые из компонентов возвращают не "готовые" значения, а промисы */
        let argsToWait = map(args, (arg, index) => {
            if(isRef(arg)) {
                if(isComplexReference(arg)) {
                    /* в случае "сложной" ссылки в массив аргументов подставляется корневой компонент */
                    let baseRef = getBaseComponentReference(arg);
                    baseRefs[index] = baseRef;
                    return argumentsSubstitutions[baseRef];
                } else {
                    return argumentsSubstitutions[arg.$ref];
                }
            } else {
                return arg;
            }
        });

        return Promise.all(argsToWait).then(resolvedArgs => {
            /* для сложных ссылок arg тут может быть объектом,
            в котором в свою очередь содержатся вложенные объекты,
            куда нужно углубиться, чтобы получить искомое значение */
            let newArgs = resolvedArgs.map((arg, index) => {
                if (complexArgs[index]) {
                    return diveIntoObjectByReferenceAndGetReferenceValue(arg, complexArgs[index], baseRefs, index);
                } else {
                    return arg;
                }
            });
        
            return proceed.apply(null, newArgs);
        });
    }

    invoke (...args) {
        return this.func.apply(null, args);
    }

    destroy () {
        forEach(this.removers, (r) => r.remove());
    }

}
