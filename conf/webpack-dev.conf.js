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
const webpackConf = require('./webpack-base.conf')();
const conf = require('./gulp.conf');

webpackConf.module.rules.push(
  {
    test: /\.scss$/,
    use: [
      'style?sourceMap',
      'css?sourceMap',
      'postcss?sourceMap',
      'resolve-url?sourceMap',
      {
        loader: 'sass',
        options: {
          sourceMap: true,
          includePaths: [`${conf.paths.src}/styles/`],
        },
      },
    ],
  }, {
    test: /\.(eot|svg|ttf|woff|woff2|png)$/,
    loader: 'url',
  }
);

webpackConf.plugins.push(
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    filename: 'vendor-[hash].js',
    minChunks: Infinity,
  })
);

webpackConf.devtool = 'inline-source-map';

module.exports = webpackConf;
