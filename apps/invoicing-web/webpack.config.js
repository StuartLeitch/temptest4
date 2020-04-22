module.exports = (nxConfig, context) => {
  const webpackConfig = {
    ...nxConfig,
    node: {
      process: true,
      global: true,
    },
  };

  // console.info(webpackConfig.module.rules[0].options.presets);
  // console.info(webpackConfig.module.rules[0].options.plugins);

  // pushing appropriate loaders for fonts and files
  webpackConfig.module.rules.unshift(
    // Fonts
    {
      test: /\.(ttf|eot|woff|woff2)$/,
      loader: "file-loader",
      options: {
        esModule: false,
        name: "fonts/[name].[ext]",
      },
    },
    // Files
    {
      test: /\.(jpg|jpeg|png|gif|svg|ico)$/,
      loader: "file-loader",
      options: {
        esModule: false,
        name: "static/[name].[ext]",
      },
    },
  );

  // Adjusting sass-loader options inherited from base webpack.config
  // reason: beginning from sass-loader version 8.x.x options like includePaths, precision and fiber should stay inside sassOptions option
  // debugging: you may use console.log for inspecting below rules in case of future compiling issues
  delete webpackConfig.module.rules[3].oneOf[3].use[2].options.includePaths;
  delete webpackConfig.module.rules[3].oneOf[3].use[2].options.precision;
  delete webpackConfig.module.rules[3].oneOf[3].use[2].options.fiber;
  webpackConfig.module.rules[3].oneOf[3].use[2].options.sassOptions = {
    includePaths:
      webpackConfig.module.rules[3].oneOf[3].use[2].options.includePaths,
    precision: webpackConfig.module.rules[3].oneOf[3].use[2].options.precision,
    fiber: webpackConfig.module.rules[3].oneOf[3].use[2].options.fiber,
  };

  // both sets are for sass-loader
  delete webpackConfig.module.rules[3].oneOf[7].use[3].options.includePaths;
  delete webpackConfig.module.rules[3].oneOf[7].use[3].options.precision;
  delete webpackConfig.module.rules[3].oneOf[7].use[3].options.fiber;
  webpackConfig.module.rules[3].oneOf[7].use[3].options.sassOptions = {
    includePaths:
      webpackConfig.module.rules[3].oneOf[7].use[3].options.includePaths,
    precision: webpackConfig.module.rules[3].oneOf[7].use[3].options.precision,
    fiber: webpackConfig.module.rules[3].oneOf[7].use[3].options.fiber,
  };

  return webpackConfig;
};
