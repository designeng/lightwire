import createContext, { mergeSpecs } from './lib/createContext';

import customErrors from './lib/errors';

import args from './decorators/args';
import defer from './decorators/defer';
import fork from './decorators/fork';
import injectJson from './decorators/injectJson';

export default createContext;

export const utils = {
    mergeSpecs
}

export const decorators = {
    args,
    defer,
    fork,
    injectJson
}

export const errors = customErrors;
