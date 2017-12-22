// Const
const Uglify = require('uglifyjs-webpack-plugin');

// Exporting
module.exports = {
    entry: './index.js',
    output: {filename: 'xp-primus.js', path: `${__dirname}/dist`},
    plugins: [new Uglify({uglifyOptions: {output: {comments: /^$/}}})],
    externals: {
        'expandjs': 'XP',
        'primus.io': 'Primus',
        'xp-emitter': 'XPEmitter',
        'xp-script': 'XPScript'
    }
};
