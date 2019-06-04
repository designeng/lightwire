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
    @args()
    second: () => Promise(resolve => {
        msleep(10);
        resolve(`second`);
    })
}

const spec = {
    @defer([firstSpec, secondSpec])
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

    it('context A component should have field first', () => {
        expect(context.A.first).to.equal('first');
    });

    it('context A component should have field second', () => {
        expect(context.A.second).to.equal('second');
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
