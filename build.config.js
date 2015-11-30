/*
 * This file/module contains all configuration for the build process.
 */

/*
 * This is a collection of patterns.
 * These paths are used in the configuration of
 * build tasks.
 */
var cfg = {};

cfg.pkg = require('./package.json');
cfg.bowerDir = 'bower_components/';
cfg.npmDir = 'node_modules/';
cfg.bowerAssets = [cfg.bowerDir + 'hippo-theme/dist/**/*.{svg,woff,woff2,ttf,eot,png}'];
cfg.bowerLinks = [cfg.bowerDir + 'hippo-theme/dist/**'];
cfg.supportedBrowsers = ['last 1 Chrome versions', 'last 1 Firefox versions', 'Safari >= 7', 'Explorer >= 10'];
cfg.proxyContext = '/rest';
cfg.proxy = {
  target: 'api.qa.onehippo.io',
  changeOrigin: true,
  https: true,
  pathRewrite: {
    '^/rest': ''
  }
};

cfg.srcDir = 'src/';
cfg.src = {};
cfg.src.styles = cfg.srcDir + 'styles/**.*.scss';
cfg.src.indexStyles = cfg.srcDir + 'styles/' + cfg.pkg.name + '.scss';
cfg.src.images = cfg.srcDir + 'images/**/*.{png,jpg,gif,ico}';
cfg.src.fonts = cfg.srcDir + 'fonts/**/*';
cfg.src.indexScript = cfg.srcDir + 'angularjs/' + cfg.pkg.name + '.js';
cfg.src.jstplModule = cfg.pkg.name + '.tpls';
cfg.src.unitTests = cfg.srcDir + 'angularjs/**/*.spec.js';
cfg.src.scripts = cfg.srcDir + 'angularjs/**/!(*.spec).js';
cfg.src.templates = cfg.srcDir + 'angularjs/**/*.html';
cfg.src.indexHtml = cfg.srcDir + 'index.html';

cfg.distDir = 'dist/';
cfg.dist = {};
cfg.dist.indexHtml = cfg.distDir + 'index.html';
cfg.dist.styles = cfg.distDir + 'styles/';
cfg.dist.fonts = cfg.distDir + 'fonts/';
cfg.dist.scripts = cfg.distDir + 'scripts/';
cfg.dist.indexScript = cfg.distDir + 'scripts/' + cfg.pkg.name + '.js';
cfg.dist.images = cfg.distDir + 'images/';

module.exports = cfg;
