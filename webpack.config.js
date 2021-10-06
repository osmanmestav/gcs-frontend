const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: ['./src/login.js', './src/main.js'],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'public')
    }, 
    // watch: true,
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/
        }]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{
                from: "src/login",
                to: "login"
            }, {
                from: "src/libs",
                to: "libs"
            }, {
                from: "src/GCSMap",
                to: "GCSMap"
            }, {
                from: "src/Gauges",
                to: "Gauges"
            }]
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
};
