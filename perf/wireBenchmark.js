import polyfill from '@babel/polyfill'; /* for async/await support */

import when from 'when';
import createContext from 'wire/lib/context';

import wireSpec from './specs/wire';
import waitALittle from './utils/waitALittle';
import getTime from './utils/getTime';
import runExpressServer from './utils/runExpressServer';

import { CYCLES_COUNT, SAMPLE_PERIOD } from './config';

export default async function main() {
    let start = getTime();
    let memory = [];
    const runContextCreation = (index) => {
        return createContext(wireSpec, null, { require }).then(context => {
            if(index % SAMPLE_PERIOD === 0) {
                let { rss, heapTotal, heapUsed, external } = process.memoryUsage();

                memory.push({
                    time: getTime(),
                    rss,
                    heapTotal,
                    heapUsed,
                    external
                });
                console.log(index);
            }

            // return when(waitALittle()).then(() => context.destroy());
            
            return context.destroy();
        }).catch(err => {
            console.error('Error in context creation');
        })
    }

    await when.iterate(
        index => index + 1,
        index => index >= CYCLES_COUNT,
        runContextCreation,
        0
    ).then(() => {
        /* generage report and open in browser */
        let end = getTime();
        runExpressServer('wire', memory, end - start);
    })
}
