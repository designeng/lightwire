import http from 'http';
import { map, forEach, assign } from 'lodash';
import { expect } from 'chai';
import uuid from 'uuid';
import { msleep } from './utils/sleep';

import createContext from '../../src/lib/createContext';
import { ComponentInvocationError } from '../../src/lib/errors';
import args from '../../src/decorators/args';
import resolver from '../../src/decorators/resolver';

const getRequest = () => {
    var options = {
        host: 'localhost',
        port: '3001',
        path: `/${uuid.v4()}`,
        method: 'GET'
    }

    return new Promise((resolve, reject) => {
        callback = function(response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                resolve(str);
            });

            response.on('error', function (error) {
                reject(error);
            });
        }

        http.request(options, callback);
    });
}

const spec = {
    @args()
    requestNotExistingResource: () => {
        return getRequest();
    },

    @resolver()
    componentWithReject: () => (resolve, reject) => {
        return reject('Some reason');
    }
}

describe('Reject in spec', async () => {
    let context, errors = [];

    before(function(done) {
        createContext(spec).then(ctx => {
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

const specWithReferenceError = {
    @args()
    someComponent: () => aaa, /* should throw ComponentInvocationError */
}

describe('specWithReferenceError', async () => {
    let context, errors = [];

    before(function(done) {
        createContext(specWithReferenceError).then(ctx => {
            context = ctx;
        }).catch(error => {
            errors.push(error);
        }).finally(done);
    });

    it('Context should not be created', () => {
        expect(context).not.to.be.ok;
    });

    it('Errors length should be not zero', () => {
        expect(errors[0] instanceof ReferenceError).to.be.ok;
    });

    after(async function() {
        try {
            if(context && context.destroy) context.destroy();
        } catch (error) {
            console.log('ERROR on destroy:' , error);
        }
    });
});
