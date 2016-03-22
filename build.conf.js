/*
 * Copyright 2015-2016 Hippo B.V. (http://www.onehippo.com)
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

const appRootDir = require('app-root-dir');
const getRelativeModulePath = require('./utils.js').getRelativeModulePath;
const gutil = require('gulp-util');
const yargs = require('yargs').argv;

function exitOnErrorHandler(error) {
  gutil.log('Unhandled error found, exiting gulp:', error.toString());
  return process.exit(1);
}

function buildConfig(customConfig) {
  const customCfg = customConfig || {};

  /* Gulp file and folder glob patterns */
  const cfg = {
    appRoot: appRootDir.get(),
    srcDir: 'src',
    distDir: customCfg.distDir || 'dist',
    npmDir: 'node_modules',
    bowerDir: 'bower_components',
    bowerLinks: [],
    copyFiles: [],
    coverageDir: 'coverage',
  };

  cfg.targetBowerDir = cfg.distDir + cfg.bowerDir;
  cfg.targetNpmDir = cfg.distDir + cfg.npmDir;

  cfg.src = {
    indexHtml: `${cfg.srcDir}/*.html`,
    templates: `${cfg.srcDir}/**/!(index|*.fixture).html`,
    indexStyles: `${cfg.srcDir}/**/[!_]*.scss`,
    styles: `${cfg.srcDir}/**/*.scss`,
    indexScript: `${cfg.srcDir}/index.js`,
    scripts: `${cfg.srcDir}/**/!(*.spec|*.fixture).js`,
    unitTests: `${cfg.srcDir}/**/*.spec.js`,
    fixtures: {
      pattern: `${cfg.srcDir}/**/*.fixture.+(js|html|css|json)`,
      included: false,
    },
    images: `${cfg.srcDir}/images/**/*.{png,jpg,gif,ico,svg}`,
    fonts: `${cfg.srcDir}/fonts/**/*`,
    i18n: `${cfg.srcDir}/i18n/**`,
  };

  cfg.dist = {
    indexHtml: `${cfg.distDir}/*.html`,
    indexScript: `${cfg.distDir}/scripts/index.js`,
    scripts: `${cfg.distDir}/scripts/`,
    styles: `${cfg.distDir}/styles/`,
    images: `${cfg.distDir}/images/`,
    fonts: `${cfg.distDir}/fonts/`,
    i18n: `${cfg.distDir}/i18n/`,
  };

  /* Gulp Task configuration options */
  cfg.env = {};
  cfg.env.maven = false;

  cfg.plumberOptions = {};
  if (yargs.failOnGulpError) {
    cfg.plumberOptions.errorHandler = exitOnErrorHandler;
  }

  cfg.serverPort = 9000;

  cfg.supportedBrowsers = [
    'last 1 Chrome versions',
    'last 1 Firefox versions',
    'Safari >= 8',
    'Explorer >= 11',
  ];

  cfg.serverMiddlewares = [];

  cfg.sassLintConfig = {
    rules: {
      'clean-import-paths': 0,
      'force-element-nesting': 0,
      'hex-length': 'long',
      'empty-line-between-blocks': 0,
      include: 0,
    },
  };

  cfg.esLintConfig = {
    parser: 'babel-eslint',
    extends: 'airbnb/base',
    useEslintrc: false,
    env: {
      jasmine: true,
    },
    globals: {
      angular: true,
      $: true,
      $j: true,
      inject: true,
      module: true,
    },
    rules: {
      'max-len': 0,
      'no-param-reassign': 0,
    },
  };

  cfg.systemjsOptions = {
    transpiler: 'babel',
    defaultJSExtensions: true,
  };

  cfg.karmaConfig = `${cfg.appRoot}/karma.conf.js`;
  cfg.karmaFixtureProxyPath = `/base/${cfg.srcDir}/angularjs/`;

  cfg.karma = {
    basePath: '.',
    frameworks: ['systemjs', 'jasmine-jquery', 'jasmine', 'es6-shim'],
    reporters: ['progress', 'coverage'],
    browsers: ['Chrome'],
    autoWatch: true,
    singleRun: false,
    preprocessors: {
      [cfg.src.scripts]: ['coverage'],
      [cfg.src.templates]: ['ng-html2js'],
    },
    coverageReporter: {
      instrumenters: {
        isparta: require('isparta'),
      },
      instrumenter: {
        '**/*.js': 'isparta',
      },
      reporters: [
        {
          type: 'html',
        }, {
          type: 'text-summary',
        },
      ],
    },
    ngHtml2JsPreprocessor: {
      stripPrefix: 'src/angularjs/',
      moduleName: 'templates',
    },
    systemjs: {
      config: {
        transpiler: 'babel',
        defaultJSExtensions: true,
        paths: {
          babel: getRelativeModulePath('babel-core/browser'),
          systemjs: getRelativeModulePath('systemjs/dist/system'),
          'system-polyfills': getRelativeModulePath('systemjs/dist/system-polyfills'),
          'es6-module-loader': getRelativeModulePath('es6-module-loader/dist/es6-module-loader'),
        },
      },
    },
    proxies: {
      '/spec/javascripts/fixtures/': cfg.karmaFixtureProxyPath,
      '/spec/javascripts/fixtures/json/': cfg.karmaFixtureProxyPath,
    },
  };

  return Object.assign({}, cfg, customCfg);
}

module.exports = buildConfig;
