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

'use strict';

/**
 *  This file contains the variables used in other gulp files
 *  which defines tasks
 *  By design, we only put there very generic config values
 *  which are used in several places to keep good readability
 *  of the tasks
 */

const path = require('path');
const gutil = require('gulp-util');
const basePath = process.cwd();
const pkg = require(`${basePath}/package.json`);

/**
 *  The main paths of your project handle these with care
 */
exports.paths = {
  basePath,
  public: '/',
  src: `${basePath}/src`,
  dist: `${basePath}/dist`,
  npmDir: `${basePath}/node_modules`,
  tasks: 'gulp_tasks',
};

exports.exclude = {
  vendors: [],
};

exports.vendors = Object.keys(pkg.dependencies)
  .filter(name => exports.exclude.vendors.indexOf(name) === -1);

exports.path = {};
for (const pathName in exports.paths) {
  if (exports.paths.hasOwnProperty(pathName)) {
    exports.path[pathName] = function pathJoin(...args) {
      const pathValue = exports.paths[pathName];
      const funcArgs = Array.prototype.slice.call(args);
      const joinArgs = [pathValue].concat(funcArgs);

      return path.join.apply(this, joinArgs);
    };
  }
}

/**
 *  Common implementation for an error handler of a Gulp plugin
 */
exports.errorHandler = function (title) {
  return function (err) {
    gutil.log(gutil.colors.red(`[${title}]`), err.toString());
    this.emit('end');
  };
};

