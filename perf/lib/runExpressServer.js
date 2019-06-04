import fs from 'fs';
import { exec } from 'child_process';
import { template } from 'lodash';
import express from 'express';

import { CYCLES_COUNT } from '../config';

export default function runExpressServer(perfName, memory, seconds) {
    let tpl = fs.readFileSync(__dirname + '/heapProfile.html', 'utf-8');

    let compiled = template(tpl);

    let app = express();

    app.get('/', function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(compiled({
            perfName,
            memory: JSON.stringify(memory),
            seconds,
            cyclesCount: CYCLES_COUNT,
            noCache: new Date().getTime()
        }));
    });

    app.get('/heapProfile.js', function (req, res) {
        fs.readFile(__dirname + '/heapProfile.js', 'utf-8', (error, heapProfileScript) => {
            res.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
            res.end(heapProfileScript);
        });
    });

    app.listen(3000, function () {
        console.log('Open http://localhost:3000');
        exec('open -a "Google Chrome" http://localhost:3000');
    });
}
