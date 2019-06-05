import { map, forEach, assign, first } from 'lodash';
import { expect } from 'chai';
import { promisify } from 'util';
import when from 'when';
import pidtree from 'pidtree';

import createContext from '../../src/lib/createContext';
import args from '../../src/decorators/args';
import fork from '../../src/decorators/fork';

const Promise = when.promise;
const pidtreeP = promisify(pidtree);

const spec = {
    @fork(__dirname + '/fixtures/toFork.js')
    forkedProcess: {},

    @args({$ref: 'forkedProcess'})
    forkedProcessPid: (forkedProcess) => Promise(resolve => {
        let childProcess = forkedProcess();
        childProcess.on('message', ({ pid }) => {
            resolve(pid);
        })
    })
}

describe('Create context with fork decorator', async () => {
    let context;

    before(async function() {
        try {
            context = await createContext(spec);
        } catch (error) {
            console.log('ERROR:' , error);
        }
    });

    it('context forkedProcess component should be a function', () => {
        expect(context.forkedProcess).to.be.a('function');
    });

    it('current process pidtree should not be empty', async () => {
        try {
            let pids = await pidtreeP(process.pid);
            expect(pids).to.be.an('array');
        } catch(err) {
            console.log('Error in pidtreeP', err);
        }
    });

    after(async function() {
        try {
            await context.destroy();
        } catch (error) {
            console.log('ERROR on destroy:' , error);
        }
    });
});
