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

    it('context should have A component with value', () => {
        expect(context.A).to.equal('CBD');
    });
});

const specsToMerge = [{
    @args()
    C: () => `C`
}, {
    @args({$ref: 'B'}, {$ref: 'C'})
    A: (b, c) => `A_${b}_${c}`
}, {
    @args()
    B: () => `B`
}]

describe('Should create context from specs array', async () => {
    let context;

    before(async function() {
        try {
            context = await createContext(specsToMerge);
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('context should be an object', () => {
        expect(context).to.be.an('object');
    });

    it('context should have A component with value', () => {
        expect(context.A).to.equal('A_B_C');
    });
});

const specWithDotInRef = {
    @args()
    environment: () => ({
        data: 'some_str'
    }),

    @args({$ref: 'environment.data'})
    first: (data) => `first_${data}`
}

describe('Access to injected object fields by dot', async () => {
    let context;

    before(async function() {
        try {
            context = await createContext(specWithDotInRef);
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('context A should have component with value', () => {
        expect(context.first).to.equal('first_some_str');
    });

    after(async function() {
        try {
            context.destroy();
        } catch (error) {
            console.log('ERROR on destroy:' , error);
        }
    });
});
