import { expect } from 'chai';
import { mergeSpecs } from '../../src/lib/createContext';

describe('Function mergeSpecs', async () => {
    let resultSpec;

    before(function() {
        resultSpec = mergeSpecs([{
            a: 1
        }, [{
            b: 2
        }, {
            c: 3
        }]])
    });

    it('should return object', () => {
        expect(resultSpec).to.be.an('object');
    });

    it('should merge specs defined in nested array', () => {
        expect(resultSpec.a).to.equal(1);
        expect(resultSpec.b).to.equal(2);
        expect(resultSpec.c).to.equal(3);
    });
});
