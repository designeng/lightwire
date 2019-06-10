import meld from 'meld';
import { map, reduce, isObject, isString, first } from 'lodash';

const DOT = '.';

export function isRef(arg) {
    return arg && arg.hasOwnProperty('$ref') && isString(arg.$ref);
}

export default class ComponentModule {

    /**
     * @param {Function} func
     * @param {Object} ready
     * @returns {ComponentModule}
     */
    constructor (func, ready) {
        this.func = func;
        this.ready = ready;

        this.removers = [];

        let remover = meld.around(this, 'invoke', this.aroundAspect);
    }

    aroundAspect(joinpoint) {
        let { args, proceed } = joinpoint;
        let readyArguments = this.ready;

        let resolvedArgs = map(args, arg => {
            if(isRef(arg)) {
                let refString = arg.$ref;
                if(refString.indexOf(DOT) != -1) {
                    let fragments = refString.split(DOT);
                    let firstFragment = fragments.shift();
                    let length = fragments.length;
                    if(readyArguments.hasOwnProperty(firstFragment)) {
                        let readyArg = reduce(fragments, (res, fragment) => {
                            if(res.hasOwnProperty(fragment)) {
                                res = res[fragment];
                                return res;
                            } else {
                                throw new Error(`Can not resolve $ref ${refString}`);
                            }
                        }, readyArguments[firstFragment]);
                        return readyArg;
                    } else {
                        throw new Error(`Can not resolve $ref ${refString}`);
                    }
                } else {
                    return this.ready[refString];
                }
            } else {
                return arg;
            }
        });

        proceed.apply(null, resolvedArgs);
    }

    invoke (args) {
        this.func(args);
    }

}
