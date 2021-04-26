module.exports = {
    input: 'src/index.js',
    output: {
        file: './dist/lightwire.js',
        format: 'cjs',
        exports: 'named'
    },
    external: [
        'lodash',
        'when',
        'when/sequence',
        'meld',
        'child_process'
    ]
}
