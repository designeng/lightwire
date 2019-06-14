import args from '../../src/decorators/args';
import defer from '../../src/decorators/defer';
import injectJson from '../../src/decorators/injectJson';

const firstSpec = {
    @args({$ref: 'someHeavyComponent'})
    first: (someHeavyComponent) => ({
        one: 'first',
        two: someHeavyComponent
    })
}

const secondSpec = {
    @args()
    second: () => 'second'
}

const responseSpec = {
    @args({$ref: '__env.url'}, {$ref: 'first'})
    response: (url, first) => ({
        json: [
            url + '?q=' + first,
            url + '?q=2',
            url + '?q=3'
        ]
    })
}

export default {
    @args()
    someHeavyComponent: () => {
        let arr = [];
        for (var i = 0; i < 100; i++) {
            arr.push(`${i}_AAAAAAAAAAAA`);
        }
        return arr;
    },

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

    @defer([firstSpec, secondSpec], {$ref: 'someHeavyComponent'})
    someDep: {},

    @args()
    __env: () => ({
        url: 'http://example.com'
    }),

    // @injectJson(
    //     [firstSpec, responseSpec],
    //     {$ref: '__env'}
    // )
    // someResult: {},
}
