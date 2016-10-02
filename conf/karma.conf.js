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
const customKarma = conf.custom && conf.custom.karma ? conf.custom.karma : {};

module.exports = function karmaConfig(config) {
  const configuration = {
    basePath: conf.paths.basePath,
    browsers: [
      'Chrome',
    ],
    frameworks: [
      'jasmine-jquery',
      'jasmine',
    ],
    files: [
      conf.path.src('index.spec.js'),
      {
        pattern: conf.path.src('**/*.fixture.+(js|html|css|json)'),
        included: false,
      },
    ].concat(customKarma.files || []),
    preprocessors: {
      [conf.path.src('index.spec.js')]: [
        'webpack',
        'sourcemap',
      ],
      [conf.path.src('**/!(*fixture).html')]: [
        'ng-html2js',
      ],
    },
    proxies: Object.assign({
      '/spec/javascripts/fixtures/': karmaFixtureProxyPath,
      '/spec/javascripts/fixtures/json/': karmaFixtureProxyPath,
    }, customKarma.proxies),
    ngHtml2JsPreprocessor: {
      stripPrefix: `${conf.paths.src}/`,
    },
    reporters: [
      'mocha',
      'coverage',
    ],
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
