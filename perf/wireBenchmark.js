import polyfill from '@babel/polyfill'; /* for async/await support */

import when from 'when';
import wire from 'essential-wire';

import wireSpec from './specs/wire';
import waitALittle from './utils/waitALittle';
import runExpressServer from './utils/runExpressServer';

export default async function main() {
    let memory = [];
    const runContextCreation = (index) => {
        return wire(wireSpec).then(context => {
            if(index % 200 === 0) {
                let { rss, heapTotal, heapUsed, external } = process.memoryUsage();

                memory.push({
                    time: Math.floor(new Date().getTime() / 1000),
                    rss,
                    heapTotal,
                    heapUsed,
                    external
                });
                console.log(index);
            }

            return when(waitALittle()).then(() => context.destroy());
        }).catch(err => {
            console.error('Error in context creation');
        })
    }

    await when.iterate(
        index => index + 1,
        index => index >= 10000,
        runContextCreation,
        0
    ).then(() => {
        /* generage report and open in browser */
        runExpressServer(memory);
    })
}
