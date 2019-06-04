import args from '../../src/decorators/args';
import { isArray } from 'lodash';
import { mergeSpecs } from 'wire/lib/specUtils';

function defer(...config) {
    return (target, name, description) => {
        let spec;
        if(isArray(config[0])) {
            spec = mergeSpecs(config[0]);
        } else {
            spec = config[0];
        }
        return {
            value: {
                wire: {
                    spec,
                    defer: true,
                    provide: config[1]
                }
            }
        }
    }
}

const firstSpec = {
    @args()
    first: () => 'first'
}

const secondSpec = {
    @args()
    second: () => 'second'
}

export default {
    @args({$ref: 'someDep'})
    someComponent: (someDep) => {
        return someDep().then(ctx => {
            let { first, second } = ctx;
            ctx.destroy();

            let arr = [];
            for (var i = 0; i < 10; i++) {
                arr.push(`${i}_${first}_${second}`);
            }
            return arr;
        });
    },

    @defer([firstSpec, secondSpec])
    someDep: {}
}
