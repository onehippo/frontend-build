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
const clone = require('clone');
const SassLintPlugin = require('sasslint-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');

const conf = require('./gulp.conf');

const baseConf = {
  entry: {
    app: conf.path.src('index'),
  },
  output: {
    filename: '[name]-[hash].js',
    path: conf.paths.dist,
    publicPath: conf.paths.publicPath,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        exclude: /node_modules/,
        loader: 'eslint?cache=true',
      },
      {
        test: /.json$/,
        loader: 'json',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'ng-annotate',
          'babel',
        ],
      },
      {
        test: /.html$/,
        exclude: conf.custom.htmlExcludes || null,
        loader: 'html',
      },
    ],
  },
  plugins: [
    new SassLintPlugin({
      context: conf.paths.src,
      ignoreFiles: [conf.path.src('vendor.scss')],
      ignorePlugins: ['extract-text-webpack-plugin', 'html-webpack-plugin'],
    }),
    new CopyWebpackPlugin([
      {
        context: conf.paths.src,
        from: '**/!(*.js|*.scss|*.html|*.fixture.*)',
        to: conf.paths.dir,
      },
    ].concat(conf.custom.copyFiles || [])),
    new HtmlWebpackPlugin({
      template: conf.path.src('index.html'),
      inject: true,
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        context: conf.paths.dist,
        output: {
          path: conf.paths.dist,
        },
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
      },
    }),
  ],
};

// allow dependencies to be empty in package.json
if (conf.vendors) {
  baseConf.entry.vendor = conf.vendors;
}

// Load modules (value) and bind them to a variable (key),
// e.q. new webpack.ProvidePlugin({ $: "jquery" }) will load the jquery
// module and make it available in a variable named $.
// See https://webpack.github.io/docs/list-of-plugins.html#provideplugin
if (conf.custom.provide) {
  const providePlugin = new webpack.ProvidePlugin(conf.custom.provide);
  baseConf.plugins.push(providePlugin);
}

module.exports = () => clone(baseConf);
