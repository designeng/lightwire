export default {
    someComponent: {
        create: {
            module: (d) => {
                let arr = []
                for (var i = 0; i < 10; i++) {
                    arr.push(`${i}_${d}`);
                }
                return arr;
            },
            args: [
                {$ref: 'someDep'}
            ]
        }
    },

    someDep: {
        create: {
            module: () => 'someDep'
        }
    }
}
