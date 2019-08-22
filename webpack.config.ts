import {resolve} from 'path';
import {lib} from 'serverless-webpack';
import {Configuration} from 'webpack';

const config: Configuration = {
  mode: lib.webpack.isLocal ? 'development' : 'production',
  entry: lib.entries,
  target: 'node',
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: resolve(__dirname, 'dist'),
    filename: '[name]/index.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: [],
};

module.exports = config;
