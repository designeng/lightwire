module.exports = {
    input: 'src/index.js',
    output: {
        file: './dist/lightwire.js',
        format: 'cjs',
    },
    external: [
        'lodash',
        'when',
        'when/sequence',
        'meld',
        'child_process'
    ]
}
