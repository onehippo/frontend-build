import autoprefixer from 'gulp-autoprefixer';
import browserSync from 'browser-sync'
import concat from 'gulp-concat';
import debug from 'gulp-debug';
import del from 'del';
import esLint from 'gulp-eslint';
import gulp from 'gulp';
import gulpif from 'gulp-if';
import imagemin from 'gulp-imagemin';
import minifyCss from 'gulp-minify-css';
import minifyHtml from 'gulp-minify-html';
import ngAnnotate from 'gulp-ng-annotate';
import rev from 'gulp-rev';
import sass from 'gulp-sass';
import sassLint from 'gulp-sass-lint';
import templateCache from 'gulp-angular-templatecache';
import uglify from 'gulp-uglify';
import usemin from 'gulp-usemin';
import plumber from 'gulp-plumber';
import karma from 'karma';
import insert from 'gulp-insert';
import Builder from 'systemjs-builder';
import proxyMiddleware from 'http-proxy-middleware';
import buildConfig from './build.config.js';

//TODO: add wiredep
//TODO: add proxy for server task

export function loadGulpTasks(customConfig) {
  const cfg = Object.assign(buildConfig, customConfig);

  const systemjs = new Builder('./', {
    transpiler: 'babel'
  });

  const browserSyncServer = browserSync.create();

  function clean() {
    return del([cfg.distDir]).then(function(paths) {
      console.log('Deleted files/folders:\n', paths.join('\n'));
    });
  }

  function styles() {
    return gulp
      .src(cfg.src.indexStyles)
      .pipe(plumber())
      .pipe(sassLint())
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

  function scripts(done) {
    gulp.series(
      function lintES6() {
        return gulp
          .src(cfg.src.scripts)
          .pipe(plumber())
          .pipe(esLint())
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
            module: cfg.pkg.name
          })))
          .pipe(ngAnnotate())
          .pipe(concat(cfg.pkg.name + '.js'))
          .pipe(gulp.dest(cfg.dist.scripts))
          .pipe(browserSyncServer.stream());
      })(done);
  }

  function unitTests(done) {
    gulp
      .src(cfg.src.unitTests)
      .pipe(plumber())
      .pipe(esLint())
      .pipe(esLint.format())
      .pipe(esLint.failOnError());

    const Server = new karma.Server({
      configFile: __dirname + '/karma.config.js'
    }, done);

    Server.start();
  }

  function unitTestsDebug(done) {
    gulp
      .src(cfg.src.unitTests)
      .pipe(plumber())
      .pipe(esLint())
      .pipe(esLint.format())
      .pipe(esLint.failOnError());

    const Server = new karma.Server({
      configFile: __dirname + '/karma.config.js',
      browsers: ['Chrome'],
      singleRun: false
    }, done);

    Server.start();
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
        baseDir: ['./dist/', './'],
        middleware: proxyMiddleware('/rest', cfg.proxy)
      },
      port: 9000
    });
  }

  function watch() {
    gulp.watch(cfg.src.styles, styles);
    gulp.watch(cfg.src.images, images);
    gulp.watch(cfg.src.fonts, fonts);
    gulp.watch(cfg.src.bowerLinks, gulp.parallel(build));
    gulp.watch(cfg.src.indexHtml, dev);
    gulp.watch(cfg.src.scripts, gulp.series(scripts, unitTests));
    gulp.watch(cfg.src.unitTests, unitTests);
  }

  function build(done) {
    gulp.series(clean, gulp.parallel(scripts, styles, images, bowerAssets, dev))(done);
  }

  function buildDist(done) {
    gulp.series(build, dist)(done);
  }

  function server(done) {
    gulp.series(build, gulp.parallel(localServer, watch))(done);
  }

  function serverDist(done) {
    gulp.series(buildDist, gulp.parallel(localServer, watch))(done);
  }

  gulp.task(watch);
  gulp.task(build);
  gulp.task(buildDist);
  gulp.task(server);
  gulp.task(serverDist);
  gulp.task(unitTests);
  gulp.task(unitTestsDebug);
}
