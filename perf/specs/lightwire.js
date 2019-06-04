import args from '../../src/decorators/args';
import defer from '../../src/decorators/defer';

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
