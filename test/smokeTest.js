import { map, forEach, assign } from 'lodash';
import { expect } from 'chai';
import when from 'when';
import { msleep } from 'sleep';

import createContext from '../src/lib/createContext';

const Promise = when.promise;

const spec = {
    A: {
        create: {
            method: (c, b) => Promise(resolve => {
                msleep(10);
                resolve(c + b);
            }),
            args: [
                {$ref: 'C'},
                {$ref: 'B'}
            ]
        }
    },

    B: {
        create: {
            method: (d) => Promise(resolve => {
                msleep(10);
                resolve('B');
            }),
        }
    },

    C: {
        create: {
            method: (d) => Promise(resolve => {
                msleep(10);
                resolve('C' + d);
            }),
            args: [
                {$ref: 'D'}
            ]
        }
    },

    D: {
        create: {
            method: () => Promise(resolve => {
                msleep(100);
                resolve('D');
            })
        }
    }
}

export default function main () {
    return when(createContext(spec)).then(ctx => {
        console.log(ctx);
    }).catch(err => {
        console.log('ERROR:' , err);
    })
}
