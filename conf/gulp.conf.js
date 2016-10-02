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

/**
 *  This file contains the variables used in other gulp files
 *  which defines tasks
 *  By design, we only put there very generic config values
 *  which are used in several places to keep good readability
 *  of the tasks
 */

const path = require('path');
const basePath = process.cwd();
const pkg = require(`${basePath}/package.json`);

// Import custom config of end project
const customConf = require(`${basePath}/build.conf`);
exports.custom = customConf;

exports.exclude = {
  vendors: [].concat(customConf.vendorExcludes),
};

exports.vendors = Object.keys(pkg.dependencies)
  .filter(name => exports.exclude.vendors.indexOf(name) === -1);

/**
 *  The main paths of your project handle these with care
 */
exports.paths = {
  basePath,
  public: customConf.public || '/',
  src: `${basePath}/src`,
  dist: customConf.dist || `${basePath}/dist`,
  npmDir: `${basePath}/node_modules`,
  tasks: 'gulp_tasks',
};

/**
 *  Each entry in exports.paths is exposed in export.path as a helper function 
 *  that returns a file path relative to it, e.g. if exports.paths.src = 'folder/to/src', 
 *  then export.path.src('main', 'index.js') returns '/folder/to/src/main/index.js'
 */
exports.path = {};

Object.keys(exports.paths).forEach(pathName => {
  exports.path[pathName] = function pathJoin(...funcArgs) {
    const pathValue = exports.paths[pathName];
    const args = [pathValue].concat(funcArgs);
    return path.join.apply(this, args);
  };
});

