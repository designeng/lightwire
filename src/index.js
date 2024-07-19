import createContext, { mergeSpecs } from './lib/createContext';

import customErrors from './lib/errors';

import args from './decorators/args';

export default createContext;

export const utils = {
    mergeSpecs
}

export const decorators = {
    args,
}

export const errors = customErrors;
