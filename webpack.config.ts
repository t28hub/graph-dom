import { resolve } from 'path';
import { Configuration } from 'webpack';
import nodeExternals from 'webpack-node-externals';

const config: Configuration = {
  entry: {
    server: './src/server.ts',
  },
  target: 'node',
  resolve: {
    extensions: ['.ts', '.js', '.json', '.graphql'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      // https://www.apollographql.com/docs/react/recipes/webpack/
      {
        test: /\.graphql$/,
        loader: 'graphql-tag/loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: [nodeExternals()],
};

module.exports = config;
