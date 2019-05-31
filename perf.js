import { assign } from 'lodash';
import when from 'when';
import createContext from './src/lib/createContext';
import args from './src/decorators/args';

const toMb = (n) => n / 1024 / 1024;

const spec = {
    @args({$ref: 'someDep'})
    someComponent: (d) => {
        let arr = []
        for (var i = 0; i < 10000; i++) {
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
            if(index % 50 === 0) {
                let { rss, heapTotal, heapUsed, external } = process.memoryUsage();

                memoryRes.push({
                    rss: toMb(rss),
                    heapTotal: toMb(heapTotal),
                    heapUsed: toMb(heapUsed),
                    external: toMb(external)
                });
            }
            return context.destroy();
        }).catch(err => {
            console.error('Error in context creation');
        })
    }

    await when.iterate(
        index => index + 1,
        index => index >= 10000,
        runContextCreation,
        0
    );

    console.table(memoryRes);
}
