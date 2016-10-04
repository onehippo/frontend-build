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

const gulp = require('gulp');
const util = require('gulp-util');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const ProgressBar = require('progress');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');

const webpackDevConf = require('../conf/webpack-dev.conf');
const webpackDistConf = require('../conf/webpack-dist.conf');
const webpackServerConf = require('../conf/webpackServer.conf');

const defaultStatsOptions = {
  colors: util.colors.supportsColor,
  hash: false,
  children: false,
  version: false,
  chunkModules: false,
  timings: false,
  chunks: false,
  chunkOrigins: false,
  modules: false,
  cached: false,
  cachedAssets: false,
  reasons: false,
  source: false,
  errorDetails: false,
  assets: false,
};

function parseConfig(options) {
  const config = Object.create(options.config || options);

  if (options.progress) {
    const bar = new ProgressBar('[:bar] Webpack build :percent - :task', {
      width: 8,
      total: 100,
      clear: true,
    });
    config.plugins.push(new ProgressPlugin({
      handler: (progress, msg) => bar.update(progress, { task: msg }),
      profile: options.profile,
    }));
  }
  config.profile = options.profile;

  return config;
}

function webpackBuild(options, done) {
  const config = parseConfig(options);

  webpack(config, (err, stats) => {
    const details = stats.toJson();

    if (err) {
      done(new util.PluginError('webpack-build', err));
    } else if (details.errors.length > 0) {
      done(new util.PluginError('webpack-build', stats.toString('errors-only')));
    } else {
      let statsOptions = 'errors-only';
      if (options.verbose) {
        statsOptions = 'verbose';
      } else if (options.stats) {
        statsOptions = Object.assign({}, defaultStatsOptions, options.stats);
      }
      util.log(`Webpack build successful\n${stats.toString(statsOptions)}`);
      done();
    }
  });
}

function webpackServe(options) {
  const config = parseConfig(options);
  const serverConfig = Object.create(webpackServerConf);

  if (options.verbose) {
    serverConfig.stats = 'verbose';
  } else {
    serverConfig.stats = Object.assign({}, defaultStatsOptions, serverConfig.stats, options.stats);
  }

  const compiler = webpack(config);
  const server = new WebpackDevServer(compiler, serverConfig);
  server.listen(serverConfig.port);
}

gulp.task('webpack:dev', done => {
  webpackBuild({
    config: webpackDevConf,
    progress: true,
    stats: {
      assets: true,
      version: true,
      hash: true,
    },
  }, done);
});

gulp.task('webpack:profile', done => {
  webpackBuild({
    config: webpackDevConf,
    progress: true,
    verbose: true,
    profile: true,
  }, done);
});

gulp.task('webpack:dist', done => {
  webpackBuild(webpackDistConf, done);
});

gulp.task('webpack:serve', () => {
  webpackServe({
    config: webpackDevConf,
    progress: true,
  });
});

gulp.task('webpack:distServe', () => {
  webpackServe({
    config: webpackDistConf,
    progress: true,
  });
});

