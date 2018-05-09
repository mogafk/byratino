const path = require('path');

const IS_WATCH = process.env.WATCH !== undefined;

module.exports = {
    target: 'web',
    entry: './index.js',
    output: {
        path: __dirname,
        filename: 'bundle.js'
    },
    watch: IS_WATCH,
    devtool: 'eval',
};