import { expect } from 'chai';

import createContext from '../../dist/lightwire.js';
import { decorators } from '../../dist/lightwire.js';

describe('Export from /dist/lightwire.js build', async () => {
    it('should export createContext', () => {
        expect(createContext).to.be.ok;
    });

    it('should export decorators', () => {
        expect(decorators).to.be.ok;
    });

    it('should export decorators.args', () => {
        expect(decorators.args).to.be.ok;
    });

    it('should export decorators.defer', () => {
        expect(decorators.defer).to.be.ok;
    });

    it('should export decorators.fork', () => {
        expect(decorators.fork).to.be.ok;
    });

    it('should export decorators.injectJson', () => {
        expect(decorators.injectJson).to.be.ok;
    });
});
