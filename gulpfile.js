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

const del = require('del');
const gulp = require('gulp');
const conf = require('./conf/gulp.conf');

const webpackTasks = require('./gulp_tasks/webpack');
const karmaTasks = require('./gulp_tasks/karma');

function clean() {
  return del([conf.paths.dist]);
}

gulp.task(clean);
gulp.task('build', gulp.series('clean', webpackTasks.webpackBuildDist));
gulp.task('buildDev', gulp.series('clean', webpackTasks.webpackBuildDev));
gulp.task('buildProfile', gulp.series('clean', webpackTasks.webpackBuildProfile));
gulp.task('start', webpackTasks.webpackServeDev);
gulp.task('startDist', webpackTasks.webpackServeDist);
gulp.task('testOnce', karmaTasks.karmaSingleRun);
gulp.task('test', karmaTasks.karmaAutoRun);
