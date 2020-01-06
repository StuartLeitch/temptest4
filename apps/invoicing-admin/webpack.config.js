const babelWebpackConfig = require('@nrwl/react/plugins/babel');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var config = require('./config');

const BASE_PATH = process.env.BASE_PATH || '/';

module.exports = webpackConfig => {
  // config.module.rules.unshift(...);
  webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
      template: config.srcHtmlLayout,
      inject: false,
      chunksSortMode: 'none'
    })
  );
  return babelWebpackConfig(webpackConfig);
};
