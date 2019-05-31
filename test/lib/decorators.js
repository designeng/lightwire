import { map, forEach, assign } from 'lodash';
import { expect } from 'chai';
import when from 'when';
import { msleep } from 'sleep';

import createContext from '../../src/lib/createContext';
import args from '../../src/decorators/args';

const Promise = when.promise;

const spec = {
    @args({$ref: 'C'}, {$ref: 'B'}, {$ref: 'D'})
    A: (c, b, d) => Promise(resolve => {
        msleep(10);
        resolve(c + b + d);
    }),

    @args()
    B: () => Promise(resolve => {
        msleep(10);
        resolve('B');
    }),

    @args()
    C: () => Promise(resolve => {
        msleep(10);
        resolve('C');
    }),

    D: 'D'
}

describe('Use args decorator for component definition', async () => {
    let context;

    before(async function() {
        try {
            context = await createContext(spec);
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('context should be an object', () => {
        expect(context).to.be.an('object');
    });

    it('context should have a component with value', () => {
        expect(context.A).to.equal('CBD');
    });
});
