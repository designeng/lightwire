import { map, forEach, assign } from 'lodash';
import { expect } from 'chai';
import when, { Promise } from 'when';
import { msleep } from 'sleep';

import createContext from '../src/lib/createContext';

const spec = {
    A: {
        create: {
            method: (c, b) => Promise(resolve => {
                msleep(10);
                resolve(c + b);
            }),
            args: [
                {$ref: 'C'},
                {$ref: 'B'}
            ]
        }
    },

    B: {
        create: {
            method: (d) => Promise(resolve => {
                msleep(10);
                resolve('B');
            }),
        }
    },

    C: {
        create: {
            method: (d) => Promise(resolve => {
                msleep(10);
                resolve('C' + d);
            }),
            args: [
                {$ref: 'D'}
            ]
        }
    },

    D: {
        create: {
            method: () => Promise(resolve => {
                msleep(100);
                resolve('D');
            })
        }
    }
}

describe('Create context from spec', async () => {
    let context;
    try {
        context = await createContext(spec);
    } catch (error) {
        console.log('ERROR:' , error);
    }

    it('context should be object', () => {
        expect(context).to.be.an('object');
    });

    it('context should have c component with value', () => {
        expect(context.C).to.equal('C');
    });

    it('context should have e component with value', () => {
        expect(context.B).to.equal('B');
    });

    it('context should have a component with value', () => {
        expect(context.A).to.equal('CDB');
    });
});
