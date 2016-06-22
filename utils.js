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

const path = require('path');
const appRootDir = require('app-root-dir');
const gutil = require('gulp-util');

function getRelativeModulePath(moduleName) {
  const appRoot = appRootDir.get();
  const modulePath = require.resolve(moduleName);
  return path.relative(appRoot, modulePath);
}

function exitOnErrorHandler(error) {
  gutil.log('Unhandled error found, exiting gulp:', error.toString());
  return process.exit(1);
}

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
}

function mergeDeep(target, source) {
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
  }
  return target;
}

module.exports = {
  exitOnErrorHandler,
  getRelativeModulePath,
  mergeDeep,
};
