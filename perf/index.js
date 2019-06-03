import fs from 'fs';
import { template } from 'lodash';
import when from 'when';
import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import createContext from '../src/lib/createContext';
import args from '../src/decorators/args';

const Promise = when.promise;

const waitOneSecond = () => Promise(resolve => {
    setTimeout(resolve, 100);
})

const toMb = (n) => Number((n / 1024 / 1024).toFixed(2));

const spec = {
    @args({$ref: 'someDep'})
    someComponent: (d) => {
        let arr = []
        for (var i = 0; i < 1000; i++) {
            arr.push(`${i}_${d}`);
        }
        return arr;
    },

    @args()
    someDep: () => 'someDep'
}

export default async function main() {
    let memoryRes = [];
    const runContextCreation = (index) => {
        return createContext(spec).then(context => {
            if(index % 5 === 0) {
                let { rss, heapTotal, heapUsed, external } = process.memoryUsage();

                memoryRes.push({
                    time: Math.floor(new Date().getTime() / 1000),
                    rss: toMb(rss),
                    heapTotal: toMb(heapTotal),
                    heapUsed: toMb(heapUsed),
                    external: toMb(external)
                });
            }

            return when(waitOneSecond()).then(() => context.destroy());
        }).catch(err => {
            console.error('Error in context creation');
        })
    }

    await when.iterate(
        index => index + 1,
        index => index >= 50,
        runContextCreation,
        0
    ).then(() => {
        /* generage report and open in browser */

        let tpl = fs.readFileSync(__dirname + '/heapProfile.html', 'utf-8');
        let heapProfileScript = fs.readFileSync(__dirname + '/heapProfile.js', 'utf-8');

        let compiled = template(tpl);

        let app = express();

        app.get('/', function (req, res) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(compiled({
                memory: JSON.stringify(memoryRes),
                noCache: new Date().getTime()
            }));
        });

        app.get('/heapProfile.js', function (req, res) {
            res.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
            res.end(heapProfileScript);
        });

        app.listen(3000, function () {
            console.log('Open http://localhost:3000');
            exec('open -a "Google Chrome" http://localhost:3000');
        });

        console.table(memoryRes);
    })
}
