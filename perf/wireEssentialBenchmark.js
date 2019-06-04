import when from 'when';
import run from './lib/run';

import wireSpec from './specs/wire';
import wire from 'essential-wire';

export default function main() {
    run('essential-wire', () => wire(wireSpec));
}
