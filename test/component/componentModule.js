import { } from 'lodash';
import { expect } from 'chai';

const chai = require('chai');
const spies = require('chai-spies');
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

xdescribe('ComponentModule invoke', async () => {

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

    it('Instance should return value when invoked', () => {
        expect(componentModule.invoke({$ref: 'one'})).to.equal('some_ONE_VALUE');
    });
});

describe('ComponentModule invoke with complex $ref', () => {
    const func = (prop) => {
        return prop.replace(/_VALUE/, '');
    }

    let componentModule;

    before(function() {
        try {
            componentModule = new ComponentModule(func, ready);
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('Instance invoke called with', () => {
        var spy = sinon.spy(componentModule, 'func');
        componentModule.invoke({$ref: 'two.prop1'});
        expect(spy.calledWith(ready.two.prop1)).to.be.ok;
    });

    after(() => {
        sinon.restore();
    })
});
