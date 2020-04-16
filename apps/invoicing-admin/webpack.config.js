module.exports = (nxConfig, context) => {
  const webpackConfig = {
    ...nxConfig,
    node: {
      process: true,
      global: true,
    },
  };

  webpackConfig.module.rules.unshift(
    // Fonts
    {
      test: /\.(ttf|eot|woff|woff2)$/,
      loader: 'file-loader',
      options: {
        esModule: false,
        name: 'fonts/[name].[ext]',
      },
    },
    // Files
    {
      test: /\.(jpg|jpeg|png|gif|svg|ico)$/,
      loader: 'file-loader',
      options: {
        esModule: false,
        name: 'static/[name].[ext]',
      },
    }
  );

  // console.info(webpackConfig.module.rules[3].oneOf[0].use);

  delete webpackConfig.module.rules[3].oneOf[3].use[2].options.includePaths;
  delete webpackConfig.module.rules[3].oneOf[3].use[2].options.precision;
  delete webpackConfig.module.rules[3].oneOf[3].use[2].options.fiber;
  webpackConfig.module.rules[3].oneOf[3].use[2].options.sassOptions = {
    includePaths:
      webpackConfig.module.rules[3].oneOf[3].use[2].options.sassOptions.includePaths,
    precision: webpackConfig.module.rules[3].oneOf[3].use[2].options.precision,
    fiber: webpackConfig.module.rules[3].oneOf[3].use[2].options.fiber,
  };


  delete webpackConfig.module.rules[3].oneOf[7].use[3].options.includePaths;
  delete webpackConfig.module.rules[3].oneOf[7].use[3].options.precision;
  delete webpackConfig.module.rules[3].oneOf[7].use[3].options.fiber;
  webpackConfig.module.rules[3].oneOf[7].use[3].options.sassOptions = {
    includePaths:
      webpackConfig.module.rules[3].oneOf[7].use[3].options.includePaths,
    precision: webpackConfig.module.rules[3].oneOf[7].use[3].options.precision,
    fiber: webpackConfig.module.rules[3].oneOf[7].use[3].options.fiber,
  };

  // console.info(webpackConfig.module.rules[3].oneOf[3].use[2]);
  // console.info(webpackConfig.module.rules[3].oneOf[7].use[3]);

  return webpackConfig;
};
