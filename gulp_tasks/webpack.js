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
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const webpackConf = require('../conf/webpack.conf');
const webpackDistConf = require('../conf/webpack-dist.conf');
const webpackDevServerConf = require('../conf/webpack-dev-server.conf.js');

function webpackWrapper(conf, startServer, done) {
  const compiler = webpack(conf);

  if (startServer) {
    const server = new WebpackDevServer(compiler, webpackDevServerConf);
    server.listen(webpackDevServerConf.port);
  } else {
    compiler.run(done);
  }
}

gulp.task('webpack:dev', done => {
  webpackWrapper(webpackConf, false, done);
});

gulp.task('webpack:dist', done => {
  webpackWrapper(webpackDistConf, false, done);
});

gulp.task('webpack:serve', done => {
  webpackConf.entry.app.unshift(`webpack-dev-server/client?http://localhost:${webpackDevServerConf.port}/`, 'webpack/hot/dev-server');
  webpackWrapper(webpackConf, true, done);
});

gulp.task('webpack:distServe', done => {
  webpackWrapper(webpackDistConf, true, done);
});
