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

var objectAssign = require('lodash.assign');
var appRootDir = require('app-root-dir');
var getRelativeModulePath = require('./utils.js').getRelativeModulePath;
var gutil = require('gulp-util');
var yargs = require('yargs').argv;

function exitOnErrorHandler(error) {
  gutil.log('Unhandled error found, exiting gulp:', error.toString());
  return process.exit(1);
}

function buildConfig(customConfig) {
  var cfg = {};
  var customCfg = customConfig || {};

  /* All the folder/file patterns*/
  cfg.appRoot = appRootDir.get() + '/';
  cfg.srcDir = customCfg.srcDir || 'src/';
  cfg.distDir = customCfg.distDir || 'dist/';
  cfg.bowerDir = customCfg.bowerDir || 'bower_components/';
  cfg.npmDir = customCfg.npmDir || 'node_modules/';
  cfg.targetBowerDir = cfg.distDir + cfg.bowerDir;
  cfg.targetNpmDir = cfg.distDir + cfg.npmDir;
  cfg.coverageDir = 'coverage/';

  cfg.projectName = require(cfg.appRoot + 'package.json').name;

  cfg.src = {};
  cfg.src.styles = cfg.srcDir + 'styles/**/*.scss';
  cfg.src.indexStyles = cfg.srcDir + 'styles/' + cfg.projectName + '.scss';
  cfg.src.images = cfg.srcDir + 'images/**/*.{png,jpg,gif,ico,svg}';
  cfg.src.fonts = cfg.srcDir + 'fonts/**/*';
  cfg.src.indexScript = cfg.srcDir + 'angularjs/' + cfg.projectName + '.js';
  cfg.src.unitTests = cfg.srcDir + '**/*.spec.js';
  cfg.src.scripts = cfg.srcDir + '**/!(*.spec).js';
  cfg.src.templates = cfg.srcDir + '**/!(index|*.fixture).html';
  cfg.src.fixtures = cfg.srcDir + '**/*.fixture.{html,css,json}';
  cfg.src.i18n = cfg.srcDir + 'i18n/**';
  cfg.src.indexHtml = cfg.srcDir + 'index.html';

  cfg.dist = {};
  cfg.dist.indexHtml = cfg.distDir + 'index.html';
  cfg.dist.styles = cfg.distDir + 'styles/';
  cfg.dist.fonts = cfg.distDir + 'fonts/';
  cfg.dist.scripts = cfg.distDir + 'scripts/';
  cfg.dist.indexScript = cfg.distDir + 'scripts/' + cfg.projectName + '.js';
  cfg.dist.images = cfg.distDir + 'images/';
  cfg.dist.i18n = cfg.distDir + 'i18n/';

  cfg.bowerLinks = [];
  cfg.karmaFixtureProxyPath = '/base/' + cfg.srcDir + 'angularjs/';

  cfg.copyFiles = [
    {
      src: cfg.bowerDir + 'hippo-theme/dist/**/*.{svg,woff,woff2,ttf,eot,png}',
      dest: cfg.distDir
    },
    {
      src: 'bower_components/dragula.js/*.min.*',
      dest: 'target/hippo-cm/dragula'
    }
  ];

  /* Gulp Task configuration options */
  cfg.env = {};
  cfg.env.maven = false;

  cfg.plumberOptions = {};

  if (yargs.failOnGulpError) {
    cfg.plumberOptions.errorHandler = exitOnErrorHandler;
  }

  cfg.supportedBrowsers = [
    'last 1 Chrome versions',
    'last 1 Firefox versions',
    'Safari >= 7',
    'Explorer >= 10',
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
    globals: {
      angular: true,
      $: true,
    },
    rules: {
      'max-len': 0,

      // Needed for ngInject to work with classes :(
      'padded-blocks': 0,
      'no-param-reassign': 0,
    },
  };

  cfg.esLintTestConfig = objectAssign(cfg.esLintConfig, {
    extends: 'airbnb/legacy',
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
      'padded-blocks': 0,
      'no-param-reassign': 0,
      'func-names': 0,
    },
  });

  cfg.systemjsOptions = {
    transpiler: 'babel',
    defaultJSExtensions: true,
  };

  cfg.serverPort = 9000;

  cfg.karmaConfig = cfg.appRoot + 'karma.conf.js';

  cfg.karma = {
    basePath: '.',
    frameworks: ['systemjs', 'jasmine-jquery', 'jasmine', 'es6-shim'],
    reporters: ['progress', 'coverage'],
    preprocessors: {},
    browsers: ['PhantomJS'],
    autoWatch: false,
    singleRun: true,
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
      moduleName: cfg.projectName + '-templates',
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
          'phantomjs-polyfill': getRelativeModulePath('phantomjs-polyfill/bind-polyfill'),
        },
      },
    },
    proxies: {
      '/spec/javascripts/fixtures/': cfg.karmaFixtureProxyPath,
      '/spec/javascripts/fixtures/json/': cfg.karmaFixtureProxyPath,
    },
  };

  cfg.karma.preprocessors[cfg.src.scripts] = ['coverage'];
  cfg.karma.preprocessors[cfg.src.templates] = ['ng-html2js'];

  return objectAssign(cfg, customCfg);
}

module.exports = buildConfig;
