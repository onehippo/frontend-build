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

const util = require('gulp-util');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const ProgressBar = require('progress');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');

const conf = require('../conf/gulp.conf');
const webpackDevConf = require('../conf/webpack-dev.conf');
const webpackDistConf = require('../conf/webpack-dist.conf');
const webpackServerConf = require('../conf/webpackServer.conf');

const defaultStatsOptions = {
  assets: false,
  cached: false,
  cachedAssets: false,
  children: false,
  chunkModules: false,
  chunkOrigins: false,
  chunks: false,
  colors: util.colors.supportsColor,
  errorDetails: false,
  hash: false,
  modules: false,
  reasons: false,
  source: false,
  timings: false,
  version: false,
};

function parseOptions(options) {
  const buildConfig = Object.create(options.config || options);
  const serveConfig = options.serve ? Object.create(webpackServerConf) : null;

  if (options.progress) {
    const bar = new ProgressBar('[:bar] Webpack build :percent - :task', {
      width: 8,
      total: 100,
      clear: true,
    });
    buildConfig.plugins.push(new ProgressPlugin({
      handler: (progress, msg) => bar.update(progress, { task: msg }),
      profile: options.profile,
    }));
  }
  buildConfig.profile = options.profile;

  if (options.serve) {
    // use inline mode unless disabled in end project
    const useInline = options.inline || true;

    // Ensure entry.app is an array so we can unshift the dev-server sources
    if (!Array.isArray(buildConfig.entry.app)) {
      buildConfig.entry.app = [buildConfig.entry.app];
    }

    if (options.verbose) {
      serveConfig.stats = 'verbose';
    } else {
      serveConfig.stats = Object.assign({}, defaultStatsOptions, serveConfig.stats, options.stats);
    }

    if (useInline) {
      serveConfig.inline = true;
      buildConfig.entry.app.unshift(`webpack-dev-server/client?http://localhost:${serveConfig.port}/`);
    }

    if (options.hmr) {
      serveConfig.hot = true;
      buildConfig.entry.app.unshift('webpack/hot/dev-server');
      buildConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    }
  }

  return {
    buildConfig,
    serveConfig,
  };
}

function webpackWrapper(options, done) {
  const { buildConfig, serveConfig } = parseOptions(options);

  if (options.serve) {
    const compiler = webpack(buildConfig);
    const server = new WebpackDevServer(compiler, serveConfig);
    server.listen(serveConfig.port);
  } else {
    webpack(buildConfig, (err, stats) => {
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
}

function webpackBuildDev(done) {
  webpackWrapper({
    config: webpackDevConf,
    progress: true,
    stats: {
      assets: true,
      version: true,
      hash: true,
    },
  }, done);
}

function webpackBuildProfile(done) {
  webpackWrapper({
    config: webpackDevConf,
    progress: true,
    verbose: true,
    profile: true,
  }, done);
}

function webpackBuildDist(done) {
  webpackWrapper(webpackDistConf, done);
}

function webpackServeDev() {
  webpackWrapper({
    config: webpackDevConf,
    progress: true,
    serve: true,
    hmr: conf.custom.hmr,
  });
}

function webpackServeDist() {
  webpackWrapper({
    config: webpackDistConf,
    progress: true,
    serve: true,
    hmr: conf.custom.hmr,
  });
}

module.exports = {
  webpackBuildDev,
  webpackBuildDist,
  webpackBuildProfile,
  webpackServeDev,
  webpackServeDist,
};
