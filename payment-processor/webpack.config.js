
module.exports = {
  fallback: { 
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify")
  }
}