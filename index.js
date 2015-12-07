var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var buildConfig = require('./build.conf.js');
var Builder = require('systemjs-builder');
var concat = require('gulp-concat');
var debug = require('gulp-debug');
var del = require('del');
var esLint = require('gulp-eslint');
var gulpif = require('gulp-if');
var imagemin = require('gulp-imagemin');
var insert = require('gulp-insert');
var karma = require('karma');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var ngAnnotate = require('gulp-ng-annotate');
var plumber = require('gulp-plumber');
var rev = require('gulp-rev');
var sass = require('gulp-sass');
var sassLint = require('gulp-sass-lint');
var templateCache = require('gulp-angular-templatecache');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');

function buildTasks(customConfig, localGulp) {
  var cfg = buildConfig(customConfig);
  var gulp = localGulp || require('gulp');

  var systemjs = new Builder('./', {
    transpiler: 'babel'
  });

  var browserSyncServer = browserSync.create();

  function clean() {
    return del([cfg.distDir]);
  }

  function styles() {
    return gulp
      .src(cfg.src.indexStyles)
      .pipe(plumber())
      .pipe(sassLint({
        rules: cfg.sassLintRules
      }))
      .pipe(sassLint.format())
      .pipe(sassLint.failOnError())
      .pipe(autoprefixer({
        browsers: cfg.supportedBrowsers
      }))
      .pipe(sass({
        sourceMapEmbed: true,
        outputStyle: 'expanded'
      }))
      .pipe(gulp.dest(cfg.dist.styles))
      .pipe(browserSyncServer.stream());
  }

  function images() {
    return gulp
      .src(cfg.src.images)
      .pipe(plumber())
      .pipe(imagemin())
      .pipe(gulp.dest(cfg.dist.images))
      .pipe(browserSyncServer.stream());
  }

  function fonts() {
    return gulp
      .src(cfg.src.fonts)
      .pipe(plumber())
      .pipe(gulp.dest(cfg.dist.fonts))
      .pipe(browserSyncServer.stream());
  }

  function bowerAssets() {
    return gulp
      .src(cfg.bowerAssets)
      .pipe(plumber())
      .pipe(gulp.dest(cfg.distDir))
      .pipe(browserSyncServer.stream());
  }

  function scripts(done) {
    gulp.series(
      function lintES6() {
        return gulp
          .src(cfg.src.scripts)
          .pipe(plumber())
          .pipe(esLint(cfg.esLintRules))
          .pipe(esLint.format())
          .pipe(esLint.failOnError());
      },
      function transpile() {
        return systemjs.buildStatic(cfg.src.indexScript, cfg.dist.indexScript, {
          sourceMaps: 'inline'
        });
      },
      function templatesNgAnnotateConcat() {
        return gulp
          .src([
            cfg.dist.indexScript,
            cfg.src.templates
          ])
          .pipe(plumber())
          .pipe(gulpif('*.html', templateCache({
            module: cfg.projectName
          })))
          .pipe(ngAnnotate())
          .pipe(concat(cfg.projectName + '.js'))
          .pipe(gulp.dest(cfg.dist.scripts))
          .pipe(browserSyncServer.stream());
      })(done);
  }

  function unitTests(done) {
    gulp
      .src(cfg.src.unitTests)
      .pipe(plumber())
      .pipe(esLint(cfg.esLintRules))
      .pipe(esLint.format())
      .pipe(esLint.failOnError());

    var server = new karma.Server({
      configFile: cfg.karmaConf
    }, done);

    server.start();
  }

  function unitTestsDebug(done) {
    gulp
      .src(cfg.src.unitTests)
      .pipe(plumber())
      .pipe(esLint())
      .pipe(esLint.format())
      .pipe(esLint.failOnError());

    var server = new karma.Server({
      configFile: cfg.karmaConf,
      browsers: ['Chrome'],
      singleRun: false
    }, done);

    server.start();
  }

  function dev() {
    return gulp
      .src(cfg.src.indexHtml)
      .pipe(plumber())
      .pipe(gulp.dest(cfg.distDir))
      .pipe(browserSyncServer.stream());
  }

  function dist() {
    return gulp
      .src(cfg.dist.indexHtml)
      .pipe(usemin({
        html: [
          minifyHtml()
        ],
        css: [
          minifyCss()
        ],
        inlinecss: [
          minifyCss()
        ],
        js: [
          uglify()
        ],
        inlinejs: [
          uglify()
        ]
      }))
      .pipe(gulp.dest(cfg.distDir));
  }

  function localServer() {
    browserSyncServer.init({
      ui: {
        port: 9001
      },
      server: {
        baseDir: [cfg.distDir, './'],
        middleware: cfg.serverMiddlewares
      },
      port: 9000
    });
  }

  function server(done) {
    gulp.series(build, gulp.parallel(localServer, watch))(done);
  }

  function serverDist(done) {
    gulp.series(buildDist, gulp.parallel(localServer, watch))(done);
  }

  function build(done) {
    gulp.series(clean, gulp.parallel(scripts, styles, images, bowerAssets, dev))(done);
  }

  function buildDist(done) {
    gulp.series(build, dist)(done);
  }

  function watch() {
    gulp.watch(cfg.src.styles, styles);
    gulp.watch(cfg.src.images, images);
    gulp.watch(cfg.src.fonts, fonts);
    gulp.watch(cfg.src.bowerLinks, gulp.parallel(build));
    gulp.watch(cfg.src.indexHtml, dev);
    gulp.watch(cfg.src.scripts, gulp.series(scripts, unitTests));
    gulp.watch(cfg.src.templates, scripts);
    gulp.watch(cfg.src.unitTests, unitTests);
  }

  gulp.task(bowerAssets);
  gulp.task(build);
  gulp.task(buildDist);
  gulp.task(clean);
  gulp.task(dev);
  gulp.task(dist);
  gulp.task(fonts);
  gulp.task(images);
  gulp.task(localServer);
  gulp.task(scripts);
  gulp.task(server);
  gulp.task(serverDist);
  gulp.task(styles);
  gulp.task(unitTests);
  gulp.task(unitTestsDebug);
  gulp.task(watch);
}

module.exports.buildTasks = buildTasks;
module.exports.buildConfig = buildConfig;
