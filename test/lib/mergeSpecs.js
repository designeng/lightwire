import { expect } from 'chai';
import { mergeSpecs } from '../../src/lib/createContext';

describe('Function mergeSpecs', async () => {
    let resultSpec;

    before(function() {
        resultSpec = mergeSpecs([{
            a: 'a'
        }, [{
            b: 'b'
        }, {
            c: 'c'
        }, [{d: 'd'}]]])
    });

    it('should return object', () => {
        expect(resultSpec).to.be.an('object');
    });

    it('should merge specs defined in nested array', () => {
        expect(resultSpec.a).to.equal('a');
        expect(resultSpec.b).to.equal('b');
        expect(resultSpec.c).to.equal('c');
        expect(resultSpec.d).to.equal('d');
    });
});
