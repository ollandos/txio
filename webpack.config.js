const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/playground/js/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/playground'),
  },
  module: {
    rules: [
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] }
    ],
  },
};
