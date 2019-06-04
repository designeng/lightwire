import polyfill from '@babel/polyfill'; /* for async/await support */

import when from 'when';
import createContext from '../src/lib/createContext';

import lightwireSpec from './specs/lightwire';
import waitALittle from './lib/waitALittle';
import getTime from './lib/getTime';
import runExpressServer from './lib/runExpressServer';
import { CYCLES_COUNT, SAMPLE_PERIOD } from './config';

export default async function main() {
    let start = getTime();
    let memory = [];
    const runContextCreation = (index) => {
        return createContext(lightwireSpec).then(context => {
            if(index % 1000 === 0) {
                console.log(index);
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
        runExpressServer('lightwire', memory, end - start);
    })
}
