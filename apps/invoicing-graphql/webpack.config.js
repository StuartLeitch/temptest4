module.exports = (config, context) => {
  config.module.rules.push({
    test: /\.graphql?$/,
    loader: 'webpack-graphql-loader'
  });

  return config;
};
