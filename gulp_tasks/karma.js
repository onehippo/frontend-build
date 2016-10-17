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

const { Server } = require('karma');

function karmaRun(config, singleRun) {
  const configFile = require.resolve('../conf/karma.conf');
  return (done) => {
    new Server({
      configFile,
      singleRun,
      autoWatch: !singleRun,
    }, (failCount) => {
      if (failCount === 0) {
        done();
      } else {
        done(new Error(`Failed ${failCount} tests.`));
      }
    }).start();
  };
}

function karmaSingleRun() {
  const singleRun = true;
  return karmaRun('karma.conf.js', singleRun);
}

function karmaAutoRun() {
  const singleRun = false;
  return karmaRun('karma.conf.js', singleRun);
}

module.exports = {
  karmaSingleRun,
  karmaAutoRun,
};
