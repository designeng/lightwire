import { map, forEach, assign } from 'lodash';
import { expect } from 'chai';
import when from 'when';
import { msleep } from 'sleep';

import createContext from '../../src/lib/createContext';

const Promise = when.promise;

const spec = {
    A: {
        create: {
            method: (b) => Promise(resolve => {
                msleep(10);
                resolve(b);
            }),
            args: [
                {$ref: 'B'}
            ]
        }
    },

    B: {
        create: {
            method: (a) => Promise(resolve => {
                msleep(10);
                resolve('A');
            }),
            args: [
                {$ref: 'A'}
            ]
        }
    }
}

describe('Detect cycles', async () => {
    let context, errors = [];

    before(async function() {
        try {
            context = await createContext(spec);
        } catch (error) {
            errors.push(error.message);
        }
    });

    it('should throw error', () => {
        expect(errors.length).to.equal(1);
    });

    it('should throw error', () => {
        expect(errors[0]).to.equal('Cycles detected');
    });
});
