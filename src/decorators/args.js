export default function args(...config) {
    return (target, name, description) => {
        return {
            value: {
                create: {
                    method: target[name],
                    args: config
                }
            }
        }
    }
}
