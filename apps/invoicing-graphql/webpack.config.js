/* eslint-disable no-undef */

module.exports = (config, context) => {
  config.module.rules.push({
    test: /\.graphql?$/,
    loader: 'webpack-graphql-loader',
  });
  config.stats.env = true;
  config.stats.timings = true;
  return config;
};
