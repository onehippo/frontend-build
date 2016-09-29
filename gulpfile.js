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
const HubRegistry = require('gulp-hub');
const conf = require('./conf/gulp.conf');

// Load tasks into the registry
const hub = new HubRegistry([conf.path.tasks('*.js')]);

// Tell gulp to use the tasks just loaded
gulp.registry(hub);

function clean() {
  return del([conf.paths.dist]);
}

gulp.task('test', gulp.series('karma:single-run'));
gulp.task('test:auto', gulp.series('karma:auto-run'));
gulp.task('clean', clean);
gulp.task('build', gulp.series('clean', 'webpack:dist'));
gulp.task('serve', gulp.series('webpack:serve'));
gulp.task('serveDist', gulp.series('webpack:distServe'));

gulp.task('default', gulp.series('build'));

module.exports = gulp;
