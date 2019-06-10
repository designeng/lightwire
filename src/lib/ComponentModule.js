import when from 'when';
import meld from 'meld';
import { map, reduce, forEach, isObject, isString, first } from 'lodash';

const DOT = '.';

export function isRef(arg) {
    return arg && arg.hasOwnProperty('$ref') && isString(arg.$ref);
}

export function isComplexReference(arg) {
    return isRef(arg) && arg.$ref.indexOf(DOT) > 0;
}

export function getComplexReferences(args) {
    return map(args, arg => isComplexReference(arg) ? 1 : 0)
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
        let argumentsSubstitutions = this.argumentsSubstitutions;
        let complexArgs = isComplexReference(args);

        let resolvedArgs = map(args, arg => {
            if(isRef(arg)) {
                let refString = arg.$ref;
                if(refString.indexOf(DOT) != -1) {
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
                    return this.argumentsSubstitutions[refString];
                }
            } else {
                return arg;
            }
        });

        return when.map(argumentsSubstitutions).then(resolvedArgs => {
            let newArgs = map(resolvedArgs, (arg, index) => {
                if(isRef(arg)) {
                    let refString = arg.$ref;
                    if(refString.indexOf(DOT) != -1) {
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
                        return this.argumentsSubstitutions[refString];
                    }
                } else {
                    return arg;
                }
            });
            return proceed.apply(null, resolvedArgs);
        })
    }

    invoke (...args) {
        return this.func.apply(null, args);
    }

    destroy () {
        forEach(this.removers, (r) => r.remove());
    }

}
