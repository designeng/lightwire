const terser = require('@rollup/plugin-terser');

module.exports = [
    {
        input: 'src/index.js',
        output: {
            file: './dist/lightwire.js',
            format: 'cjs',
            exports: 'named'
        },
        external: [
            'lodash',
            'meld',
        ]
    },
    {
        input: 'src/index.js',
        output: {
            file: './dist/lightwire.min.js',
            format: 'cjs',
            exports: 'named'
        },
        plugins: [
            terser()
        ],
        external: [
            'lodash',
            'meld',
        ]
    }
]
