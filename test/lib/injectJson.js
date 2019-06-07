import { map, forEach, assign } from 'lodash';
import { expect } from 'chai';
import when from 'when';
import { msleep } from 'sleep';

import createContext from '../../src/lib/createContext';
import args from '../../src/decorators/args';
import injectJson from '../../src/decorators/injectJson';

const Promise = when.promise;

const firstSpec = {
    @args()
    first: () => Promise(resolve => {
        msleep(10);
        resolve(`first`);
    })
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

const spec = {
    @args()
    __env: () => ({
        url: 'http://example.com'
    }),

    @injectJson(
        [firstSpec, responseSpec],
        {$ref: '__env'}
    )
    someResult: {}
}

describe('Inject decorator', async () => {
    let context;

    before(async function() {
        try {
            context = await createContext(spec);
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('A component should be an object', () => {
        expect(context).to.be.an('object');
    });

    it('someResult component should be an object', () => {
        expect(context.someResult).to.be.an('array');
    });

    it('someResult[0] should have value', () => {
        expect(context.someResult[0]).to.equal('http://example.com?q=first');
    });

    after(async function() {
        try {
            context.destroy();
        } catch (error) {
            console.log('ERROR on destroy:' , error);
        }
    });
});
