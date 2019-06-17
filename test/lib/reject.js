import { map, forEach, assign } from 'lodash';
import { expect } from 'chai';
import when from 'when';
import axios from 'axios';
import uuid from 'uuid';
import { msleep } from 'sleep';

import createContext from '../../src/lib/createContext';
import args from '../../src/decorators/args';
import resolver from '../../src/decorators/resolver';

const spec = {
    @args()
    randomUrl: () => `http://localhost:3001/${uuid.v4()}`,

    @args({$ref: 'randomUrl'})
    requestNotExistingResource: (randomUrl) => {
        return axios.get(randomUrl).then(res => res.data);
    },

    @resolver()
    componentWithReject: () => (resolve, reject) => {
        return reject('Some reason');
    }
}

describe('Reject in spec', async () => {
    let context, errors = [];

    before(function(done) {
        when(createContext(spec)).then(ctx => {
            context = ctx;
        }).catch(error => {
            errors.push(error);
        }).finally(done);
    });

    it('Context should not be created', () => {
        expect(context).not.to.be.ok;
    });

    it('Should catch error', () => {
        expect(errors.length).to.be.ok;
    });

    after(async function() {
        try {
            if(context && context.destroy) context.destroy();
        } catch (error) {
            console.log('ERROR on destroy:' , error);
        }
    });
});
