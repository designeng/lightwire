import when from 'when';
let Promise = when.promise;

export default function resolver(...args) {
    return (target, name, descriptor) => {
        let func = target[name];

        return {
            value: {
                create: {
                    module: (...args) => Promise((resolve, reject) => {
                        return func(...args)(resolve, reject);
                    }),
                    args: args
                }
            }
        }
    }
}
