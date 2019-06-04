import { map, forEach, assign } from 'lodash';
import { expect } from 'chai';
import when from 'when';
import { msleep } from 'sleep';

import createContext, { NOT_VALID_SPEC_ERROR_MESSAGE } from '../../src/lib/createContext';

const Promise = when.promise;

const spec = {
    A: {
        create: {
            module: (c, b) => Promise(resolve => {
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
            module: () => Promise(resolve => {
                msleep(10);
                resolve('B');
            }),
        }
    },

    C: {
        create: {
            module: (d) => Promise(resolve => {
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
            module: () => Promise(resolve => {
                msleep(100);
                resolve('D');
            })
        }
    },

    F: {
        create: {
            module: () => 'F'
        }
    }
}

describe('Create context from spec', async () => {
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

    it('context should have c component with value', () => {
        expect(context.C).to.equal('CD');
    });

    it('context should have e component with value', () => {
        expect(context.D).to.equal('D');
    });

    it('context should have e component with value', () => {
        expect(context.B).to.equal('B');
    });

    it('context should have a component with value', () => {
        expect(context.A).to.equal('CDB');
    });

    it('context should have free f component with value', () => {
        expect(context.F).to.equal('F');
    });

    it('context should have destroy method', () => {
        expect(context.destroy).to.be.a('function');
    });
});

describe('Should create context from empty spec', async () => {
    let context;

    before(async function() {
        try {
            context = await createContext({});
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('context should be an object', () => {
        expect(context).to.be.an('object');
    });
});

describe('Should create context from specs array', async () => {
    let context;

    before(async function() {
        try {
            context = await createContext([{}, {}]);
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('context should be an object', () => {
        expect(context).to.be.an('object');
    });
});

describe('Throw error if provided spec is not valid', async () => {
    let context, errors = [];

    before(async function() {
        try {
            context = await createContext('someNotValidSpec');
        } catch (error) {
            errors.push(error.message);
        }
    });

    it('should throw error', () => {
        expect(errors.length).to.equal(1);
    });

    it('should throw error with message', () => {
        expect(errors[0]).to.equal(NOT_VALID_SPEC_ERROR_MESSAGE);
    });
});
