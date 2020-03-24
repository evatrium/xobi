const babelJest = require('babel-jest');
const createConfig = require('rollup-configured/babel-config.js');

const config = createConfig();

module.exports = babelJest.createTransformer({
    plugins: config.plugins,
    presets: config.presets,
    babelrc: false,
    configFile: false,
});