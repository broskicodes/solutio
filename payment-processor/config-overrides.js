const webpack = require('webpack');
const dotenv = require("dotenv").config();

module.exports = function override (config, _env) {
  console.log('overriding webpack config');

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed)
    })
  );

  config.resolve.fallback = {
    "stream": require.resolve("stream-browserify"),
    "crypto": require.resolve("crypto-browserify"),
    "os": require.resolve("os-browserify"),
    "path": require.resolve("path-browserify"),
    "fs": false
  }  
  
  return config
}