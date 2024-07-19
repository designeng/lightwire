export default function resolver(...args) {
    return (target, name, descriptor) => {
        let func = target[name];

        return {
            value: {
                create: {
                    module: (...args) => new Promise((resolve, reject) => {
                        return func(...args)(resolve, reject);
                    }),
                    args: args
                }
            }
        }
    }
}
