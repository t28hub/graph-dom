import {resolve} from 'path';
import {Configuration} from 'webpack';

const config: Configuration = {
  target: 'node',
  entry: {
    'app': resolve(__dirname, 'src/index.ts'),
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: resolve(__dirname, 'dist'),
    filename: '[name]/index.js',
  },
  devtool: 'inline-source-map',
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

export default config;
