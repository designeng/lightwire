import { reduce } from 'lodash';
import { expect } from 'chai';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');

import ComponentModule from '../../src/lib/ComponentModule';

chai.use(sinonChai);

const ready = {
    one: 'ONE_VALUE',
    two: {
        prop1: 'PROP1_VALUE'
    }
}

describe('ComponentModule invoke', async () => {

    const func = (arg) => `some_${arg}`

    let componentModule;

    before(async function() {
        try {
            componentModule = new ComponentModule(func, ready);
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
    const func = (...args) => args[0]

    let componentModule, spy;

    before(function() {
        try {
            componentModule = new ComponentModule(func, ready);
            spy = sinon.spy(componentModule, 'func');
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('Instance invoke called with resolved arg', () => {
        componentModule.invoke({$ref: 'one'});
        expect(spy.calledWith(ready.one)).to.be.ok;
    });

    it('Instance invoke called with resolved arg', () => {
        componentModule.invoke({$ref: 'two.prop1'});
        expect(spy.calledWith(ready.two.prop1)).to.be.ok;
    });

    it('Instance should return value when invoked', () => {
        let res = componentModule.invoke({$ref: 'one'});
        expect(res).to.equal('ONE_VALUE');
    });

    it('Instance two.prop1 should return value when invoked', () => {
        let res = componentModule.invoke({$ref: 'two.prop1'});
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

    let componentModule, spy;

    before(function() {
        try {
            componentModule = new ComponentModule(func, {a: 1, b: 2, c: {e: 4}, d: {f: {g: 5}}});
            spy = sinon.spy(componentModule, 'func');
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('Instance should return value when invoked', () => {
        let res = componentModule.invoke(
            {$ref: 'a'},
            {$ref: 'b'},
            {$ref: 'c.e'},
            {$ref: 'd.f.g'},
        );
        expect(res).to.equal(12);
    });

    after(() => {
        componentModule.destroy();
        sinon.restore();
    })
});
