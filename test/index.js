import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import Mocha from 'mocha';

const mocha = new Mocha();
import { NULL_OR_UNDEFINED_HAS_NO_PROPERTY } from '../src/decorators/args';

const addSyncTestFiles = (dirs) => {
    _.forEach(dirs, dir => {
        fs.readdirSync(dir)
            .filter(file => {
                let arr = file.split('.');
                let name = _.first(arr);
                return _.last(arr) === 'js'
                    && _.indexOf(['runner', 'index'], name) == -1
            })
            .forEach(file => mocha.addFile(path.join(dir, file)));
    });
}

addSyncTestFiles([
    __dirname + '/lib'
]);

mocha.run(function(failures) {
    process.exitCode = failures ? 1 : 0;
    process.exit();
});

process.on('unhandledRejection', (error, promise) => {
    if(error.message.match(new RegExp(NULL_OR_UNDEFINED_HAS_NO_PROPERTY))) {
        /* do nothing */
    }
});
