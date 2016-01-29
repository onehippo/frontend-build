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

var pjson = require('./package.json');

module.exports.enableBrowserSync = function(win) {
  win = win || window;
  var browserSyncHost = '//' + win.document.location.hostname + ':3000';
  var browserSyncVersion = pjson.dependencies['browser-sync'];
  var browserSyncUrl = browserSyncHost + '/browser-sync/browser-sync-client.' + browserSyncVersion + '.js';
  var done = function() {
    console.log('BrowserSync enabled via ' + browserSyncUrl);
  };
  var fail = function() {
    console.error('BrowserSync failed to enable via' + browserSyncUrl);
  };

  if (win.jQuery) {
    win.jQuery.getScript(browserSyncUrl).done(done).fail(fail);
  } else {
    addScriptToBody(win, browserSyncUrl, done, fail);
  }
};

function addScriptToBody(win, url, done, fail) {
  var body = win.document.getElementsByTagName('body')[0];
  var script = document.createElement('script');
  script.src = url;
  script.type = 'text/javascript';
  script.charset = 'utf8';

  script.onload = function() {
    script.onload = null;
    done();
  };
  script.onerror = function() {
    script.onerror = null;
    fail();
  };

  body.appendChild(script);
}
