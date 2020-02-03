const path = require('path');

module.exports = {
  entry: "./src/index.ts",
  mode: "production",
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  optimization: { minimize: false },
  performance: { hints: false },
  resolve: {
    extensions: [ ".ts", ".js" ],
  },
  output: {
    filename: "index.js",
    libraryTarget: "commonjs2",
    path: path.resolve("."),
  },
};
