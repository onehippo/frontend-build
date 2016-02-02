var path = require('path');
var appRootDir = require('app-root-dir');

module.exports.getRelativeModulePath = function getRelativeModulePath(moduleName) {
  var appRoot = appRootDir.get();
  var modulePath = require.resolve(moduleName);
  return path.relative(appRoot, modulePath);
};
