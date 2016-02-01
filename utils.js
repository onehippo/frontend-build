var path = require('path');
var appRootDir = require('app-root-dir');

function getRelativeModulePath(moduleName) {
  var appRoot = appRootDir.get();
  var modulePath = require.resolve(moduleName);
  return path.relative(appRoot, modulePath);
}

function getRelativeModuleFolderPath(moduleName) {
  var relativeModulePath = getRelativeModulePath(moduleName);
  return path.dirname(relativeModulePath) + '/';
}

module.exports = {
  getRelativeModulePath: getRelativeModulePath,
  getRelativeModuleFolderPath: getRelativeModuleFolderPath,
};
