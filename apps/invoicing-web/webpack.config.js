const webpack = require("webpack");
const dotenv = require("dotenv");
// const getBabelWebpackConfig = require("@nrwl/react/plugins/babel");

module.exports = (config, context) => {
  // call dotenv and it will return an Object with a parsed key
  const env = dotenv.config().parsed;

  // reduce it to a nice object, the same as before
  const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});

  // const babelConfig = getBabelWebpackConfig(config);

  config.plugins.push(new webpack.DefinePlugin(envKeys));

  return config;
};
