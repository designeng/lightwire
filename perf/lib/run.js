import polyfill from '@babel/polyfill'; /* for async/await support */

import when from 'when';

import waitALittle from './waitALittle';
import getTime from './getTime';
import runExpressServer from './runExpressServer';
import { CYCLES_COUNT, SAMPLE_PERIOD } from '../config';

export default async function run(perfName, asyncFunc) {
    let start = getTime();
    let memory = [];
    const runContextCreation = (index) => {
        return asyncFunc().then(context => {
            if(index % 1000 === 0) {
                // console.log(index);
            }
            if(index % SAMPLE_PERIOD === 0) {
                let { rss, heapTotal, heapUsed, external } = process.memoryUsage();

                memory.push({
                    time: getTime(),
                    rss,
                    heapTotal,
                    heapUsed,
                    external
                });
            }

            /* TODO: with waitALittle pause no memory leaks? */
            return when(waitALittle()).then(() => context.destroy());

            // return context.destroy();
        }).catch(err => {
            console.error('Error in context creation', err);
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
        runExpressServer(perfName, memory, end - start);
    })
}
