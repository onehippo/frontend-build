/*
 * Copyright 2016 Hippo B.V. (http://www.onehippo.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const webpack = require('webpack');
const conf = require('./gulp.conf');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = {
  entry: {
    vendor: conf.vendors,
    app: [conf.path.src('index')],
  },
  output: {
    filename: '[name]-[hash].js',
    path: conf.paths.dist,
    publicPath: conf.paths.public,
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint',
      },
    ],
    loaders: [
      {
        test: /.json$/,
        loaders: [
          'json',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
          'ng-annotate',
          'babel',
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png)\w*/,
        loader: 'file',
      },
      {
        test: /.html$/,
        exclude: conf.custom.htmlExcludes || null,
        loaders: [
          'html',
        ],
      },
    ],
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: conf.path.src('index.html'),
      inject: true,
    }),
    new webpack.ProvidePlugin(conf.custom.provide),
    new CopyWebpackPlugin([
      {
        context: conf.paths.src,
        from: '**/!(*.js|*.scss|*.html|*.fixture.*)',
        to: conf.paths.dir,
      },
    ].concat(conf.custom.copyFiles || [])),
  ],
  postcss: [
    autoprefixer({
      browsers: [
        'last 1 Chrome versions',
        'last 1 Firefox versions',
        'Safari >= 8',
        'Explorer >= 11',
      ],
    }),
  ],
};
