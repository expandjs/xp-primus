// Const
const Uglify = require('uglifyjs-webpack-plugin');

// Exporting
module.exports = {
    entry: './index.js',
    externals: {
        'expandjs': 'XP',
        'primus.io': 'Primus',
        'xp-emitter': 'XPEmitter',
        'xp-script': 'XPScript'
    },
    output: {
        filename: 'xp-primus.js',
        path: `${__dirname}/dist`
    },
    plugins: [
        new Uglify({compress: {warnings: false}, output: {comments: false}})
    ]
};
