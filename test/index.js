import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import Mocha from 'mocha';

const mocha = new Mocha();

const addSyncTestFiles = (dirs) => {
    _.forEach(dirs, dir => {
        fs.readdirSync(dir)
            .filter(file => {
                let arr = file.split('.');
                let name = _.first(arr);
                return _.last(arr) === 'js'
                    && _.indexOf(['runner', 'index'], name) == -1
            })
            .forEach(file => {
                mocha.addFile(path.join(dir, file))
            });

            /* dev - test single file */
            // .forEach(file => {
            //     let fragments = dir.split('/')
            //     if(_.last(fragments) === 'lib' && [
            //         'defer.js'
            //     ].indexOf(file) != -1){
            //         mocha.addFile(path.join(dir, file))
            //     }
            // });
    });
}

addSyncTestFiles([
    __dirname + '/component',
    __dirname + '/lib',
]);

mocha.run(function(failures) {
    process.exitCode = failures ? 1 : 0;
    process.exit();
});

process.on('unhandledRejection', (error, promise) => {
    console.log('Handle the promise: ', promise, ' Caught an error: ', error);
});
