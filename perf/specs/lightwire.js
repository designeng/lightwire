import args from '../../src/decorators/args';

export default {
    @args({$ref: 'someDep'})
    someComponent: (d) => {
        let arr = [];
        for (var i = 0; i < 10; i++) {
            arr.push(`${i}_${d}`);
        }
        return arr;
    },

    @args()
    someDep: () => 'someDep'
}
