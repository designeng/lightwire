import { expect } from 'chai';

import normalizeComponentDef from '../../src/lib/normalizeComponentDef';

describe('Normalize component definition', async () => {
    let a = normalizeComponentDef('a');
    let b = normalizeComponentDef(['b']);
    let c = normalizeComponentDef({
        create: 'c'
    });
    let d = normalizeComponentDef({
        somefield: 'd'
    });

    it('component should be object', () => {
        expect(a).to.be.an('object');
    });

    it('component create.method should be function', () => {
        expect(a.create.method).to.be.an('function');
    });

    it('component create.method should be function', () => {
        expect(a.create.method()).to.equal('a');
    });

    it('component create.method result should be equal original component value', () => {
        let res = b.create.method();
        expect(res).to.be.an('array');
        expect(res[0]).to.equal('b');
    });

    it('should return object', () => {
        let res = c.create.method();
        expect(res).to.be.an('object');
        expect(res.create).to.equal('c');
    });

    it('should return object', () => {
        let res = d.create.method();
        expect(res).to.be.an('object');
        expect(res.somefield).to.equal('d');
    });
});
