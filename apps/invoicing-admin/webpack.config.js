const path = require('path');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');

const config = require('./config');
console.info(config);
// const babelWebpackConfig = require('@nrwl/react/plugins/bundle-babel');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

// const BASE_PATH = process.env.BASE_PATH || '/';

// module.exports = webpackConfig => {
//   // config.module.rules.unshift(...);
//   webpackConfig.plugins.push(
//     new HtmlWebpackPlugin({
//       template: config.srcHtmlLayout,
//       inject: false,
//       chunksSortMode: 'none'
//     })
//   );
//   return babelWebpackConfig(webpackConfig);
// };

module.exports = (nxConfig, context) => {
  const webpackConfig = {
    ...nxConfig,
    node: {
      process: true,
      global: true
    }
  };

  // console.info(webpackConfig.module.rules);

  webpackConfig.plugins.push(new ExtractCssChunks());

  webpackConfig.module.rules.unshift(
    // // Modular Styles
    // {
    //   test: /\.css$/,
    //   use: [
    //     { loader: 'style-loader' },
    //     {
    //       loader: 'css-loader',
    //       options: {
    //         modules: true,
    //         importLoaders: 1
    //       }
    //     },
    //     { loader: 'postcss-loader' }
    //   ],
    //   exclude: [path.resolve(config.srcDir, 'styles')],
    //   include: [config.srcDir]
    // },
    // {
    //   test: /\.scss$/,
    //   use: [
    //     { loader: 'style-loader' },
    //     {
    //       loader: 'css-loader',
    //       options: {
    //         modules: true,
    //         importLoaders: 1
    //       }
    //     },
    //     { loader: 'postcss-loader' },
    //     {
    //       loader: 'sass-loader',
    //       options: {
    //         includePaths: config.scssIncludes
    //       }
    //     }
    //   ],
    //   exclude: [path.resolve(config.srcDir, 'styles')],
    //   include: [config.srcDir]
    // },
    // // Global Styles
    // {
    //   test: /\.css$/,
    //   use: [ExtractCssChunks.loader, 'css-loader', 'postcss-loader'],
    //   include: [path.resolve(config.srcDir, 'styles')]
    // },
    // {
    //   test: /\.scss$/,
    //   use: [
    //     ExtractCssChunks.loader,
    //     'css-loader',
    //     'postcss-loader',
    //     {
    //       loader: 'sass-loader',
    //       options: {
    //         includePaths: config.scssIncludes
    //       }
    //     }
    //   ],
    //   include: [path.resolve(config.srcDir, 'styles')]
    // },
    {
      test: /\.(jpg|jpeg|png|gif|svg|ico)$/,
      loader: 'file-loader',
      options: {
        esModule: false,
        name: 'static/[name].[ext]'
      }
    }
  );

  return webpackConfig;
};
