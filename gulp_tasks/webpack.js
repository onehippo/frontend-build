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
const minimist = require('minimist');
const webpack = require('webpack');
const webpackStats = require('webpack/lib/Stats');
const WebpackDevServer = require('webpack-dev-server');
const ProgressBar = require('progress');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');

const conf = require('../conf/gulp.conf');
const webpackDevConf = require('../conf/webpack-dev.conf');
const webpackDistConf = require('../conf/webpack-dist.conf');
const webpackServerConf = require('../conf/webpackServer.conf');

const defaultBuildStats = Object.assign(webpackStats.presetToOptions('minimal'), {
  children: false,
  chunkOrigins: false,
  colors: util.colors.supportsColor,
  modules: false,
});

const defaultErrorStats = Object.assign(webpackStats.presetToOptions('errors-only'), {
  colors: util.colors.supportsColor,
  children: false,
});

const defaultServeStats = {
  assets: true,
  children: false,
  chunks: false,
  chunkModules: false,
  colors: util.colors.supportsColor,
  hash: false,
  timings: false,
  version: false,
};

const defaultOptions = {
  inline: true,
  progress: true,
};

const cliOptions = minimist(process.argv.slice(2), {
  boolean: ['profile', 'verbose'],
  default: {
    profile: false,
    verbose: false,
  },
});

function isObject(o) {
  return o !== undefined && o !== null && typeof o === 'object';
}

function isString(o) {
  return typeof o === 'string';
}

function getStats(defaultStats, optionStats) {
  if (isString(optionStats)) {
    return optionStats;
  }
  if (isObject(optionStats)) {
    return Object.assign({}, isObject(defaultStats) ? defaultStats : null, optionStats);
  }
  if (isString(defaultStats)) {
    return defaultStats;
  }
  return isObject(defaultStats) ? Object.assign({}, defaultStats) : null;
}

function parseOptions(opts, buildConf, serveConf) {
  if (!isObject(buildConf)) {
    throw new Error('No webpack build configuration specified, please check your task definition.');
  }

  const options = Object.assign({}, defaultOptions, opts);
  const buildConfig = Object.create(buildConf);
  const serveConfig = serveConf ? Object.create(serveConf) : null;

  options.profile = options.profile || cliOptions.profile;
  options.verbose = options.verbose || cliOptions.verbose;

  if (options.progress) {
    const bar = new ProgressBar('[:bar] Webpack build :percent - :task', {
      clear: true,
      total: 100,
      width: 8,
    });
    buildConfig.plugins.push(new ProgressPlugin({
      handler: (progress, msg) => bar.update(progress, { task: msg }),
      profile: options.profile,
    }));
  }
  buildConfig.profile = options.profile;

  if (serveConfig === null) {
    // setup build stats
    if (options.verbose) {
      options.stats = 'verbose';
    } else {
      options.stats = getStats(defaultBuildStats, options.stats);
    }
  } else {
    // setup dev server

    // Ensure entry.app is an array so we can unshift the dev-server sources
    if (!Array.isArray(buildConfig.entry.app)) {
      buildConfig.entry.app = [buildConfig.entry.app];
    }

    if (options.verbose) {
      serveConfig.stats = 'verbose';
    } else {
      serveConfig.stats = getStats(defaultServeStats, options.stats);
    }

    if (options.inline) {
      serveConfig.inline = true;
      buildConfig.entry.app.unshift(`webpack-dev-server/client?http://${serveConfig.host}:${serveConfig.port}/`);
    }

    if (options.hmr) {
      serveConfig.hot = true;
      buildConfig.entry.app.unshift('webpack/hot/dev-server');
      buildConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    }
  }

  return {
    options,
    buildConfig,
    serveConfig,
  };
}

function build(buildConf, opts) {
  return new Promise((resolve, reject) => {
    const { options, buildConfig } = parseOptions(opts, buildConf);
    webpack(buildConfig, (err, stats) => {
      if (err) {
        reject(new util.PluginError('webpack-build', err));
      } else if (stats.hasErrors()) {
        reject(new util.PluginError('webpack-build', stats.toString(defaultErrorStats)));
      } else {
        util.log(`Webpack build successful\n${stats.toString(options.stats)}`);
        resolve();
      }
    });
  });
}

function serve(buildConf, serveConf, opts) {
  const { buildConfig, serveConfig } = parseOptions(opts, buildConf, serveConf);
  util.log(util.colors.green(`Development server is booting on http://${serveConfig.host}:${serveConfig.port}`));

  const compiler = webpack(buildConfig);
  const server = new WebpackDevServer(compiler, serveConfig);
  server.listen(serveConfig.port, serveConfig.host);
}

function webpackBuildDev() {
  return build(webpackDevConf, {
    stats: {
      assets: true,
      timings: true,
    },
  });
}

function webpackBuildProfile() {
  return build(webpackDevConf, {
    verbose: true,
    profile: true,
  });
}

function webpackBuildDist() {
  return build(webpackDistConf, {
    progress: false,
  });
}

function webpackServeDev() {
  serve(webpackDevConf, webpackServerConf, {
    hmr: conf.custom.hmr,
  });
}

function webpackServeDist() {
  serve(webpackDistConf, webpackServerConf, {
    hmr: conf.custom.hmr,
  });
}

module.exports = {
  webpackBuildDev,
  webpackBuildProfile,
  webpackBuildDist,
  webpackServeDev,
  webpackServeDist,
};
