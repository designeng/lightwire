import when from 'when';
import run from './lib/run';

import lightwireSpec from './specs/lightwire';
import createContext from '../src/lib/createContext';

export default function main() {
    run('lightwire', () => createContext(lightwireSpec));
}
