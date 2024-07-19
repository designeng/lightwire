import polyfill from '@babel/polyfill'; /* for async/await support */

import waitALittle from './waitALittle';
import getTime from './getTime';
import runExpressServer from './runExpressServer';
import { CYCLES_COUNT, SAMPLE_PERIOD } from '../config';

async function iterate(initialValue, condition, iteratee, result) {
    let index = initialValue;
    while (!condition(index)) {
        await iteratee(index);
        index++;
    }
    return result;
}

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
            return waitALittle().then(() => context.destroy());

            // return context.destroy();
        }).catch(err => {
            console.error('Error in context creation', err);
        })
    }

    await iterate(
        0,
        index => index >= CYCLES_COUNT,
        runContextCreation,
        null // result (not used in this case)
    );

    /* generage report and open in browser */
    let end = getTime();
    runExpressServer(perfName, memory, end - start);
}
