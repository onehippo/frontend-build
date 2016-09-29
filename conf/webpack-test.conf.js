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

// set test environment, currently used to trigger 'istanbul' plugin in .babelrc
process.env.ENV = process.env.NODE_ENV = 'test';

module.exports = {
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
        test: /\.scss$/,
        loaders: [
          'null',
        ],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loaders: [
          'ng-annotate',
          'babel',
        ],
      },
      {
        test: /\.html$/,
        loaders: [
          'html',
        ],
      },
    ],
  },
  devtool: 'inline-source-map',
};
