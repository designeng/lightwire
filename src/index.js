import createContext from './lib/createContext';

import args from './decorators/args';
import defer from './decorators/defer';
import fork from './decorators/fork';
import injectJson from './decorators/injectJson';

export default createContext;

export const decorators = {
    args,
    defer,
    fork,
    injectJson
}
