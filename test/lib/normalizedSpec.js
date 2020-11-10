import { map, forEach, assign } from 'lodash';
import { expect } from 'chai';
import when from 'when';
import { msleep } from './utils/sleep';

import createContext from '../../src/lib/createContext';

const Promise = when.promise;

const spec = {
    A: {
        create: {
            module: (b, c, { someField }) => Promise(resolve => {
                msleep(10);
                resolve(b + c[0] + someField);
            }),
            args: [
                {$ref: 'B'},
                {$ref: 'C'},
                {$ref: 'D'},
            ]
        }
    },

    B: 'B',

    C: ['C'],

    D: {
        someField: '_D_field'
    }
}

describe('Normalize spec components before wiring', async () => {
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

    it('context should have A component with value', () => {
        expect(context.A).to.equal('BC_D_field');
    });
});
