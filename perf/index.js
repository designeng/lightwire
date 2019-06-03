import fs from 'fs';
import { assign } from 'lodash';
import when from 'when';
import createContext from '../src/lib/createContext';
import args from '../src/decorators/args';

let template = fs.readFileSync(__dirname + '/heapProfile.html', 'utf-8');

const toMb = (n) => Number((n / 1024 / 1024).toFixed(2));

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
        index => index >= 100000,
        runContextCreation,
        0
    );

    console.table(memoryRes);
}