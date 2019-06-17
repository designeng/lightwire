import { map, forEach, assign } from 'lodash';
import { expect } from 'chai';
import when from 'when';
import { msleep } from 'sleep';

import createContext from '../../src/lib/createContext';
import args from '../../src/decorators/args';
import defer from '../../src/decorators/defer';

const Promise = when.promise;

const firstSpec = {
    @args()
    first: () => Promise(resolve => {
        msleep(10);
        resolve(`first`);
    })
}

const secondSpec = {
    @args({$ref: 'environment'})
    second: (environment) => Promise(resolve => {
        msleep(10);
        resolve(`second_` + environment.url);
    })
}

const zeroSpec = {
    @args({$ref: 'environment'})
    zero: (environment) => 'zero_' + environment.url
}

const spec = {
    @args()
    environment: () => ({
        url: 'http://example.com'
    }),

    @args()
    environmentAnother: () => ({
        type: 'crud'
    }),

    @defer(zeroSpec)
    zeroDeferredComponent: {},

    @defer(
        [firstSpec, secondSpec],
        {$ref: 'environment'},
        {$ref: 'environmentAnother'}
    )
    deferredComponent: {},

    @args({$ref: 'deferredComponent'})
    A: (injectedFunc) => injectedFunc()
}

describe('Create context with deferred component', async () => {
    let context;

    before(async function() {
        try {
            context = await createContext(spec);
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('context A component should be an object', () => {
        expect(context.A).to.be.an('object');
    });

    it('context zeroDeferredComponent component should be a function', () => {
        expect(context.zeroDeferredComponent).to.be.a('function');
    });

    it('context deferredComponent component should be a function', () => {
        expect(context.deferredComponent).to.be.a('function');
    });

    it('context A component should have field first', () => {
        expect(context.A.first).to.equal('first');
    });

    it('context A component should have field second', () => {
        expect(context.A.second).to.equal('second_http://example.com');
    });

    it('context A component should have destroy method', () => {
        expect(context.A.destroy).to.be.a('function');
    });

    after(async function() {
        try {
            context.destroy();
        } catch (error) {
            console.log('ERROR on destroy:' , error);
        }
    });
});

const specOne = {
    @args()
    env: () => ({
        url: 'http://example.com'
    }),

    @args()
    envOther: () => ({
        type: 'crud'
    }),

    @args()
    someNum: () => 1,

    @defer(
        {
            @args({$ref: 'envRenamedKey'})
            a: () => 'a',

            @args({$ref: 'envOtherRenamedKey'})
            b: () => 'b',

            @args({$ref: 'someFn'})
            c: (someFn) => someFn(),

            @args({$ref: 'someArray'})
            d: (someArray) => someArray[0]
        },
        /* provide: */
        {}, /* empty object is not provided - no error should be thrown */
        {$ref: 'someNum'},
        {
            envRenamedKey: {$ref: 'env'},
            envOtherRenamedKey: {$ref: 'envOther'},
            someFn: () => 'c',
            someArray: ['d']
        }
    )
    deferredComponent: {},

    @args({$ref: 'deferredComponent'})
    A: (injectedFunc) => injectedFunc()
}

describe('Create context with deferred component & provided spec & renamed components', async () => {
    let context;

    before(async function() {
        try {
            context = await createContext(specOne);
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('context should be an object', () => {
        expect(context).to.be.an('object');
    });

    it('context A.a value', () => {
        expect(context.A.a).to.equal('a');
    });

    it('context A.b value', () => {
        expect(context.A.b).to.equal('b');
    });

    it('context A.c value', () => {
        expect(context.A.c).to.equal('c');
    });

    it('context A.d value', () => {
        expect(context.A.d).to.equal('d');
    });

    after(async function() {
        try {
            context.destroy();
        } catch (error) {
            console.log('ERROR on destroy:' , error);
        }
    });
});

const specTwo = {
    @args()
    A: () => 1,

    @defer(
        {
            @args({$ref: 'A'}, {$ref: 'B'})
            a: (a, b) => a + b
        },
        /* provide A now, provide B later when func is invoked */
        {$ref: 'A'}
    )
    deferredComponent: {},

    @args({$ref: 'deferredComponent'})
    response: (injectedFunc) => injectedFunc({B: 2})
}

describe('Create context with deferred spec & args provided when function is invoked', async () => {
    let context;

    before(async function() {
        try {
            context = await createContext(specTwo);
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('context should be an object', () => {
        expect(context).to.be.an('object');
    });

    it('context response value', () => {
        expect(context.response.a).to.equal(3);
    });

    after(async function() {
        try {
            context.destroy();
        } catch (error) {
            console.log('ERROR on destroy:' , error);
        }
    });
});
