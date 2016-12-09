// Const
const webpack = require('webpack');

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
        path: './dist'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}, output: {comments: false}})
    ]
};
