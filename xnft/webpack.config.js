const path = require("path");
const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          "nativewind",
          "@solana/web3.js",
          "@solana/spl-token",
          "@coral-xyz/anchor",
        ],
      },
    },
    argv
  );

  config.module.rules.push({
    test: /\.css$/i,
    use: ["postcss-loader"],
  });

  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: "javascript/auto",
  });

  config.resolve.fallback = { 
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify")
  };
  
  return config;
};
