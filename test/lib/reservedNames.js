import { forEach } from 'lodash';
import chai, { expect } from 'chai';

import createContext, { HEAD, createReservedNameErrorMessage } from '../../src/lib/createContext';

chai.use(require('chai-match'));

const noop = () => {}

forEach([HEAD, 'destroy'], name => {
    let context, errors = [];
    let spec = {
        [name]: noop
    }

    describe(`Reserved ${name} component name`, async () => {
        before(async function() {
            try {
                context = await createContext(spec);
            } catch (error) {
                errors.push(error.message);
            }
        });

        it('should throw reserved error', () => {
            expect(errors.length).to.equal(1);
        });

        it('should throw error with message', () => {
            expect(errors[0]).to.match(new RegExp(createReservedNameErrorMessage(name)));
        });
    });
})
