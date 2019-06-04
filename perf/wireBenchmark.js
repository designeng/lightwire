import when from 'when';
import run from './lib/run';

import wireSpec from './specs/wire';
import createContext from 'wire/lib/context';

export default function main() {
    run('wire', () => createContext(wireSpec, null, { require }));
}
