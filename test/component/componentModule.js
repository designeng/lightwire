import { reduce } from 'lodash';
import { expect } from 'chai';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');

chai.use(sinonChai);

import ComponentModule, {
    isComplexReference,
    getComplexReferences,
    findArgInArgumentSubstitutions,
    diveIntoObjectByReferenceAndGetReferenceValue
} from '../../src/lib/ComponentModule';

const argumentsSubstitutions = {
    one: 'ONE_VALUE',
    two: {
        prop1: 'PROP1_VALUE'
    }
}

describe('ComponentModule utils', () => {
    it('Detect complex reference', () => {
        expect(isComplexReference({$ref: 'one.two'})).to.be.ok;
    });

    it('Detect complex reference with more than one dot', () => {
        expect(isComplexReference({$ref: 'one.two.three'})).to.be.ok;
    });

    it('Not detect complex reference', () => {
        expect(isComplexReference({$ref: 'one'})).not.to.be.ok;
    });

    it('Not detect complex reference for simple type argument', () => {
        expect(isComplexReference('simple')).not.to.be.ok;
    });

    it('Dive into object by complex reference and get reference value', () => {
        expect(diveIntoObjectByReferenceAndGetReferenceValue({
            a: {b: {c: {d: 123}}}
        }, 'a.b.c.d')).to.equal(123);
    });

    it('Get complex references', () => {
        let refs = getComplexReferences([
            {$ref: 'a'},
            {$ref: 'a.b'},
            {$ref: 'c'},
            {$ref: 'a.b.c'}
        ])
        expect(refs).to.eql([null, 'b', null, 'b.c']);
    });

    it('Find ref in argument substitutions object', () => {
        let item = findArgInArgumentSubstitutions({
            a: {
                f: {
                    s: 's'
                }
            }
        }, {$ref: 'a.f.s'})
        expect(item).to.equal('s');
    });

    it('Find ref in argument substitutions object', () => {
        let item = findArgInArgumentSubstitutions({
            a: {
                f: {
                    s: 's'
                }
            }
        }, {$ref: 'a.f'})
        expect(item).to.eql({s: 's'});
    });

    it('Find ref in argument substitutions object', () => {
        expect(() => findArgInArgumentSubstitutions({
            a: {
                f: {
                    s: 's'
                }
            }
        }, 'a')).to.throw(TypeError);
    });
});

describe('ComponentModule invoke', async () => {

    const func = (arg) => `some_${arg}`

    let componentModule;

    before(async function() {
        try {
            componentModule = new ComponentModule(func, argumentsSubstitutions);
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('Instance should be an object', () => {
        expect(componentModule).to.be.a('object');
    });

    it('Instance should have prop func', () => {
        expect(componentModule.func).to.be.a('function');
    });

    it('Instance should have invoke method', () => {
        expect(componentModule.invoke).to.be.a('function');
    });
});

describe('ComponentModule invoke with complex $ref', () => {
    const func = (x) => x;

    let componentModule, spy;

    before(function() {
        try {
            componentModule = new ComponentModule(func, argumentsSubstitutions);
            spy = sinon.spy(componentModule, 'func');
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('Instance invoke called with resolved arg', async () => {
        await componentModule.invoke({$ref: 'one'});
        expect(spy.calledWith(argumentsSubstitutions.one)).to.be.ok;
    });

    it('Instance invoke called with resolved arg', async () => {
        await componentModule.invoke({$ref: 'two.prop1'});
        expect(spy.calledWith(argumentsSubstitutions.two.prop1)).to.be.ok;
    });

    xit('Instance should return value when invoked', async () => {
        let res = await componentModule.invoke({$ref: 'one'});
        expect(res).to.equal('ONE_VALUE');
    });

    xit('Instance two.prop1 should return value when invoked', async () => {
        let res = await componentModule.invoke({$ref: 'two.prop1'});
        expect(res).to.equal('PROP1_VALUE');
    });

    after(() => {
        componentModule.destroy();
        sinon.restore();
    })
});

describe('ComponentModule invoke with several complex args', () => {
    const func = (...args) => reduce(args, (res, x) => {
        return res + x;
    }, 0);

    let componentModule;

    before(function() {
        try {
            componentModule = new ComponentModule(func, {a: 1, b: 2, c: {e: 4}, d: {f: {g: 5}}});
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    xit('Instance should return value when invoked', async () => {
        let res = await componentModule.invoke(
            {$ref: 'a'},
            {$ref: 'b'},
            {$ref: 'c.e'},
            {$ref: 'd.f.g'}
        );
        expect(res).to.equal(12);
    });

    after(() => {
        componentModule.destroy();
    })
});
