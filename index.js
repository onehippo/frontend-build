/*
 * Copyright 2015 Hippo B.V. (http://www.onehippo.com)
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

var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var buildConfig = require('./build.conf.js');
var Builder = require('systemjs-builder');
var concat = require('gulp-concat');
var debounce = require('debounce');
var del = require('del');
var esLint = require('gulp-eslint');
var gulpif = require('gulp-if');
var imagemin = require('gulp-imagemin');
var insert = require('gulp-insert');
var Server = require('karma').Server;
var cssnano = require('gulp-cssnano');
var htmlmin = require('gulp-htmlmin');
var ngAnnotate = require('gulp-ng-annotate');
var path = require('path');
var plumber = require('gulp-plumber');
var rev = require('gulp-rev');
var sass = require('gulp-sass');
var sassLint = require('gulp-sass-lint');
var sourceMaps = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');

function buildTasks(customConfig, localGulp) {
  var cfg = buildConfig(customConfig);
  var gulp = localGulp || require('gulp');
  var bsServer = browserSync.create();

  function clean() {
    return del([cfg.distDir, cfg.coverageDir]);
  }

  function styles() {
    return gulp
      .src(cfg.src.indexStyles)
      .pipe(plumber())
      .pipe(sassLint(cfg.sassLintConfig))
      .pipe(sassLint.format())
      .pipe(sassLint.failOnError())
      .pipe(sourceMaps.init())
      .pipe(sass({
        outputStyle: 'expanded',
      }))
      .pipe(autoprefixer({
        browsers: cfg.supportedBrowsers,
      }))
      .pipe(sourceMaps.write())
      .pipe(gulp.dest(cfg.dist.styles))
      .pipe(bsServer.stream());
  }

  function images() {
    return gulp
      .src(cfg.src.images)
      .pipe(plumber())
      .pipe(imagemin())
      .pipe(gulp.dest(cfg.dist.images))
      .pipe(bsServer.stream());
  }

  function fonts() {
    return gulp
      .src(cfg.src.fonts)
      .pipe(plumber())
      .pipe(gulp.dest(cfg.dist.fonts))
      .pipe(bsServer.stream());
  }

  function bowerAssets() {
    return gulp
      .src(cfg.bowerAssets)
      .pipe(plumber())
      .pipe(gulp.dest(cfg.distDir))
      .pipe(bsServer.stream());
  }

  function symlinkDependencies() {
    return gulp.src([
      path.basename(cfg.bowerDir),
      path.basename(cfg.npmDir),
    ])
      .pipe(gulp.symlink(cfg.distDir));
  }

  function unlinkDependencies() {
    return del([
      cfg.targetBowerDir,
      cfg.targetNpmDir,
    ]);
  }

  function scripts(done) {
    gulp.series(
      function lint() {
        return gulp
          .src(cfg.src.scripts)
          .pipe(plumber())
          .pipe(esLint(cfg.esLintConfig))
          .pipe(esLint.format())
          .pipe(esLint.failAfterError());
      },

      function transpile() {
        var systemjs = new Builder();
        systemjs.config(cfg.systemjsOptions);
        return systemjs.buildStatic(cfg.src.indexScript, cfg.dist.indexScript, {
          sourceMaps: true,
        });
      },

      function annotate() {
        return gulp
          .src(cfg.dist.indexScript)
          .pipe(plumber())
          .pipe(sourceMaps.init({
            loadMaps: true,
          }))
          .pipe(ngAnnotate())
          .pipe(sourceMaps.write())
          .pipe(gulp.dest(cfg.dist.scripts));
      },

      function html2js() {
        return gulp
          .src([
            cfg.src.templates,
            cfg.dist.indexScript,
          ])
          .pipe(plumber())
          .pipe(gulpif('*.html', templateCache({
            transformUrl: function transformUrl(url) {
              return url.replace(/.*angularjs(?:\\|\/)/gi, '');
            },

            module: cfg.projectName + '-templates',
            standalone: true,
          })))
          .pipe(concat(cfg.projectName + '.js'))
          .pipe(gulp.dest(cfg.dist.scripts))
          .pipe(bsServer.stream());
      }
    )(done);
  }

  function test(done) {
    gulp.series(
      function lint() {
        return gulp
          .src(cfg.src.unitTests)
          .pipe(plumber())
          .pipe(esLint(cfg.esLintTestConfig))
          .pipe(esLint.format())
          .pipe(esLint.failAfterError());
      },

      function runKarma(karmaDone) {
        new Server({
          configFile: cfg.karmaConfig,
        }, karmaDone).start();
      }
    )(done);
  }

  function testDebug(done) {
    gulp.series(
      function lint() {
        return gulp
          .src(cfg.src.unitTests)
          .pipe(plumber())
          .pipe(esLint(cfg.esLintTestConfig))
          .pipe(esLint.format())
          .pipe(esLint.failAfterError());
      },

      function runKarma(karmaDone) {
        new Server({
          configFile: cfg.karmaConfig,
          browsers: ['Chrome'],
          autoWatch: true,
          singleRun: false,
        }, karmaDone).start();
      }
    )(done);
  }

  function i18n() {
    return gulp
      .src(cfg.src.i18n)
      .pipe(plumber())
      .pipe(gulp.dest(cfg.dist.i18n));
  }

  function dev() {
    return gulp
      .src(cfg.src.indexHtml)
      .pipe(plumber())
      .pipe(gulp.dest(cfg.distDir))
      .pipe(bsServer.stream());
  }

  function dist() {
    return gulp
      .src(cfg.dist.indexHtml)
      .pipe(usemin({
        html: [
          htmlmin(),
        ],
        css: [
          sourceMaps.init(),
          cssnano(),
          rev(),
          sourceMaps.write('./'),
        ],
        js: [
          sourceMaps.init(),
          uglify(),
          rev(),
          sourceMaps.write('./'),
        ],
      }))
      .pipe(gulp.dest(cfg.distDir))
      .pipe(bsServer.stream());
  }

  function bsServerSync() {
    if (cfg.env.maven) {
      bsServer.init();
    } else {
      bsServer.init({
        ui: {
          port: (cfg.serverPort + 1),
        },
        server: {
          baseDir: [cfg.distDir, './'],
          middleware: cfg.serverMiddlewares,
        },
        port: cfg.serverPort,
      });
    }
  }

  function bsServerSyncDist() {
    if (cfg.env.maven) {
      bsServer.init();
    } else {
      bsServer.init({
        ui: {
          port: (cfg.serverPort + 1),
        },
        server: {
          baseDir: [cfg.distDir],
          middleware: cfg.serverMiddlewares,
        },
        port: cfg.serverPort,
      });
    }
  }

  function serve(done) {
    gulp.series('build', gulp.parallel('bsServerSync', 'watch'))(done);
  }

  function serveDist(done) {
    gulp.series('buildDist', 'bsServerSyncDist')(done);
  }

  function build(done) {
    if (cfg.env.maven) {
      gulp.series('clean', gulp.parallel('scripts', 'styles', 'images', 'bowerAssets', 'i18n', 'dev', 'symlinkDependencies'))(done);
    } else {
      gulp.series('clean', gulp.parallel('scripts', 'styles', 'images', 'bowerAssets', 'i18n', 'dev'))(done);
    }
  }

  function buildDist(done) {
    if (cfg.env.maven) {
      gulp.series('build', 'dist', 'unlinkDependencies')(done);
    } else {
      gulp.series('build', 'dist')(done);
    }
  }

  function watch() {
    gulp.watch(cfg.src.styles, gulp.parallel('styles'));
    gulp.watch(cfg.src.images, gulp.parallel('images'));
    gulp.watch(cfg.src.fonts, gulp.parallel('fonts'));
    gulp.watch(cfg.src.bowerLinks, gulp.parallel('build'));
    gulp.watch(cfg.src.indexHtml, gulp.parallel('dev'));
    gulp.watch([
      cfg.src.scripts,
      cfg.src.templates,
      cfg.src.unitTests,
    ], debounce(gulp.series('scripts', 'test'), 200));
    gulp.watch(cfg.src.i18n, gulp.parallel('i18n'));
  }

  gulp.task(bowerAssets);
  gulp.task(build);
  gulp.task(buildDist);
  gulp.task(clean);
  gulp.task(dev);
  gulp.task(dist);
  gulp.task(fonts);
  gulp.task(i18n);
  gulp.task(images);
  gulp.task(bsServerSync);
  gulp.task(bsServerSyncDist);
  gulp.task(scripts);
  gulp.task(serve);
  gulp.task(serveDist);
  gulp.task(styles);
  gulp.task(symlinkDependencies);
  gulp.task(test);
  gulp.task(testDebug);
  gulp.task(unlinkDependencies);
  gulp.task(watch);
}

module.exports.buildTasks = buildTasks;
module.exports.buildConfig = buildConfig;
