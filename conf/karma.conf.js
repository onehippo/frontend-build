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

const conf = require('./gulp.conf');
const karmaFixtureProxyPath = '/base/src/angularjs/';

module.exports = function karmaConfig(config) {
  const configuration = {
    basePath: '../',
    logLevel: 'INFO',
    browsers: [
      'Chrome',
    ],
    frameworks: [
      'jasmine-jquery',
      'jasmine',
    ],
    plugins: [
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('karma-jasmine'),
      require('karma-jasmine-jquery'),
      require('karma-mocha-reporter'),
      require('karma-ng-html2js-preprocessor'),
      require('karma-sourcemap-loader'),
      require('karma-webpack'),
    ],
    files: [
      conf.path.npmDir('es6-shim/es6-shim.js'),
      conf.path.npmDir('dragula/dist/dragula.min.js'),
      conf.path.npmDir('dragula/dist/dragula.min.css'),
      conf.path.src('index.spec.js'),
      {
        pattern: conf.path.src('**/*.fixture.+(js|html|css|json)'),
        included: false,
      },
      conf.path.npmDir('jquery/dist/jquery.js'),
    ],
    preprocessors: {
      [conf.path.src('index.spec.js')]: [
        'webpack',
        'sourcemap',
      ],
      [conf.path.src('**/!(*fixture).html')]: [
        'ng-html2js',
      ],
    },
    proxies: {
      '/spec/javascripts/fixtures/': karmaFixtureProxyPath,
      '/spec/javascripts/fixtures/json/': karmaFixtureProxyPath,
    },
    ngHtml2JsPreprocessor: {
      stripPrefix: `${conf.paths.src}/`,
    },
    reporters: ['mocha', 'coverage'],
    coverageReporter: {
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
      ],
    },
    mochaReporter: {
      output: 'minimal',
    },
    webpack: require('./webpack-test.conf'),
    webpackMiddleware: {
      noInfo: true,
    },
  };

  config.set(configuration);
};
