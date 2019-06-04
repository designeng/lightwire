import createContext from '../lib/createContext';

export default function defer(...specs) {
    return (target, name, description) => {
        return {
            value: {
                create: {
                    module: () => (...args) => {
                        return createContext.apply(null, specs);
                    }
                }
            }
        }
    }
}
