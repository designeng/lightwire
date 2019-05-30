import { map, forEach, assign } from 'lodash';
import { expect } from 'chai';
import when from 'when';
import { msleep } from 'sleep';

import createContext, { HEAD, createReservedNameErrorMessage } from '../../src/lib/createContext';

const Promise = when.promise;
const noop = () => {}

forEach([HEAD, 'destroy'], name => {
    describe(`Reserved ${name} component name`, async () => {
        let context, errors = [];
        let spec = {
            [name]: {
                create: {
                    method: noop
                }
            }
        }

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
            expect(errors[0]).to.equal(createReservedNameErrorMessage(name));
        });
    });
})
