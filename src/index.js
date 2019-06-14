import createContext from './lib/createContext';

import args from './decorators/args';
import defer from './decorators/defer';
import fork from './decorators/fork';
import injectJson from './decorators/injectJson';

module.exports = createContext;

module.exports = {
    decorators: {
        args,
        defer,
        fork,
        injectJson
    }
}
