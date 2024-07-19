import { expect } from 'chai';
import { msleep } from './utils/sleep';

import createContext from '../../src/lib/createContext';
import args from '../../src/decorators/args';

const spec = {
    @args(
        {$ref: 'B'},
        {$ref: 'C'},
        {$ref: 'X.Y'},
        {$ref: 'X.Z.Q'}
    )
    A: (b, c, y, q) => {
        return 2 + b + c + y + q
    },

    @args({$ref: 'C'})
    B: (c) => new Promise(resolve => {
        msleep(10);
        resolve(c + 1);
    }),

    @args()
    C: () => new Promise(resolve => {
        msleep(20);
        resolve(1);
    }),

    @args()
    X: () => ({
        Y: 10,
        Z: {
            Q: 7
        },
    })
}

describe('Simple spec', async () => {
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
        expect(context.C).to.equal(1);
    });

    it('context should have A component with value', () => {
        expect(context.B).to.equal(2);
    });

    it('context should have A component with value', () => {
        expect(context.A).to.equal(22);
    });
});
