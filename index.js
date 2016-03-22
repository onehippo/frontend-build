/*
 * Copyright 2015-2016 Hippo B.V. (http://www.onehippo.com)
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

const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const buildConfig = require('./build.conf.js');
const Builder = require('systemjs-builder');
const concat = require('gulp-concat');
const cssnano = require('gulp-cssnano');
const debounce = require('debounce');
const del = require('del');
const esLint = require('gulp-eslint');
const filter = require('gulp-filter');
const gulpif = require('gulp-if');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const insertLines = require('gulp-insert-lines');
const ngAnnotate = require('gulp-ng-annotate');
const pkg = require('./package.json');
const plumber = require('gulp-plumber');
const rev = require('gulp-rev');
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const KarmaServer = require('karma').Server;
const karmaRunner = require('karma').runner;
const sourceMaps = require('gulp-sourcemaps');
const templateCache = require('gulp-angular-templatecache');
const uglify = require('gulp-uglify');
const usemin = require('gulp-usemin');

function buildTasks(customConfig, localGulp) {
  const cfg = buildConfig(customConfig);
  const gulp = localGulp || require('gulp');
  const bsServer = browserSync.create();

  function clean() {
    return del([cfg.distDir, cfg.coverageDir]);
  }

  function styles() {
    return gulp
      .src(cfg.src.indexStyles)
      .pipe(plumber(cfg.plumberOptions))
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
      .pipe(sourceMaps.write('./'))
      .pipe(gulp.dest(cfg.dist.styles))
      .pipe(filter('**/*.css'))
      .pipe(bsServer.stream());
  }

  function images() {
    return gulp
      .src(cfg.src.images)
      .pipe(plumber(cfg.plumberOptions))
      .pipe(imagemin())
      .pipe(gulp.dest(cfg.dist.images))
      .pipe(bsServer.stream());
  }

  function fonts() {
    return gulp
      .src(cfg.src.fonts)
      .pipe(plumber(cfg.plumberOptions))
      .pipe(gulp.dest(cfg.dist.fonts))
      .pipe(bsServer.stream());
  }

  function copyFiles(done) {
    cfg.copyFiles.forEach((copySpec) => {
      gulp.src(copySpec.src)
        .pipe(plumber(cfg.plumberOptions))
        .pipe(gulp.dest(copySpec.dest))
        .pipe(bsServer.stream());
    });
    done();
  }

  function symlinkDependencies() {
    return gulp
      .src(`${cfg.bowerDir}/**/*`)
      .pipe(gulp.dest(cfg.distDir + cfg.bowerDir));
  }

  function unlinkDependencies() {
    return del([
      cfg.targetBowerDir,
      cfg.targetNpmDir,
    ]);
  }

  function scripts(done) {
    function lintScripts() {
      return gulp
        .src(cfg.src.scripts)
        .pipe(plumber(cfg.plumberOptions))
        .pipe(esLint(cfg.esLintConfig))
        .pipe(esLint.format())
        .pipe(esLint.failAfterError());
    }

    function transpile() {
      const systemjs = new Builder();
      systemjs.config(cfg.systemjsOptions);
      return systemjs.buildStatic(cfg.src.indexScript, cfg.dist.indexScript, {
        sourceMaps: true,
      });
    }

    function annotate() {
      return gulp
        .src(cfg.dist.indexScript)
        .pipe(plumber(cfg.plumberOptions))
        .pipe(sourceMaps.init({
          loadMaps: true,
        }))
        .pipe(ngAnnotate())
        .pipe(sourceMaps.write('./'))
        .pipe(gulp.dest(cfg.dist.scripts));
    }

    function addPolyfills() {
      const babelCorePath = getRelativeModuleFolderPath('babel-core');
      const babelPolyfill = `${babelCorePath}/browser-polyfill.js`;

      return gulp
        .src([
          babelPolyfill,
          cfg.dist.indexScript,
        ])
        .pipe(plumber(cfg.plumberOptions))
        .pipe(sourceMaps.init({
          loadMaps: true,
        }))
        .pipe(concat(`${cfg.projectName}.js`))
        .pipe(sourceMaps.write('./'))
        .pipe(gulp.dest(cfg.dist.scripts));
    }

    function html2js() {
      return gulp
        .src([
          cfg.dist.indexScript,
          cfg.src.templates,
        ])
        .pipe(plumber(cfg.plumberOptions))
        .pipe(gulpif('*.html', templateCache({
          transformUrl: function transformUrl(url) {
            return url.replace(/.*angularjs(?:\\|\/)/gi, '');
          },

          module: 'templates',
          standalone: true,
        })))
        .pipe(concat('index.js'))
        .pipe(gulp.dest(cfg.dist.scripts))
        .pipe(bsServer.stream());
    }

    gulp.series(
      lintScripts,
      transpile,
      annotate,
      addPolyfills,
      html2js
    )(done);
  }

  function test(done) {
    function lintScripts() {
      return gulp
        .src(cfg.src.unitTests)
        .pipe(plumber(cfg.plumberOptions))
        .pipe(esLint(cfg.esLintConfig))
        .pipe(esLint.format())
        .pipe(esLint.failAfterError());
    }

    function runKarma(karmaDone) {
      karmaRunner.run({
        configFile: cfg.karmaConfig,
      }, karmaDone);
    }

    gulp.series(
      lintScripts,
      runKarma
    )(done);
  }

  function startKarma(done) {
    new KarmaServer({
      configFile: cfg.karmaConfig,
    }, done).start();
  }

  function testSingleRun(done) {
    new KarmaServer({
      configFile: cfg.karmaConfig,
      singleRun: true,
    }, done).start();
  }

  function i18n() {
    return gulp
      .src(cfg.src.i18n)
      .pipe(plumber(cfg.plumberOptions))
      .pipe(gulp.dest(cfg.dist.i18n));
  }

  function dev() {
    return gulp
      .src(cfg.src.indexHtml)
      .pipe(plumber(cfg.plumberOptions))
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
          cssnano({
            safe: true,
          }),
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
        watchOptions: {
          ignored: '*.map',
        },
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

  function bsInject() {
    const browserSyncVersion = pkg.dependencies['browser-sync'];
    const bsScriptPrefix = '//localhost:3000/browser-sync/browser-sync-client';
    const bsScriptPath = `${bsScriptPrefix}.${browserSyncVersion}.js`;
    const bsScriptTag = `<script src="${bsScriptPath}"></script>`;

    return gulp
      .src(cfg.src.indexHtml)
      .pipe(plumber(cfg.plumberOptions))
      .pipe(insertLines({
        before: /<\/body>$/,
        lineBefore: bsScriptTag,
      }))
      .pipe(gulp.dest(cfg.distDir))
      .pipe(bsServer.stream());
  }

  function serve(done) {
    if (cfg.env.maven) {
      gulp.series('build', 'bsInject', gulp.parallel('bsServerSync', 'watch'))(done);
    } else {
      gulp.series('build', gulp.parallel('bsServerSync', 'watch'))(done);
    }
  }

  function serveDist(done) {
    gulp.series('buildDist', 'bsServerSyncDist')(done);
  }

  function build(done) {
    if (cfg.env.maven) {
      gulp.series(
        'clean',
        gulp.parallel(
          'scripts',
          'styles',
          'images',
          'copyFiles',
          'i18n',
          'dev',
          'symlinkDependencies'
        )
      )(done);
    } else {
      gulp.series(
        'clean',
        gulp.parallel('scripts',
          'styles',
          'images',
          'copyFiles',
          'i18n',
          'dev'
        )
      )(done);
    }
  }

  function buildDist(done) {
    if (cfg.env.maven) {
      gulp.series('build', 'dist', 'unlinkDependencies')(done);
    } else {
      gulp.series('build', 'dist')(done);
    }
  }

  function watchForChanges() {
    gulp.watch(cfg.src.styles, gulp.series('styles'));
    gulp.watch(cfg.src.images, gulp.series('images'));
    gulp.watch(cfg.src.fonts, gulp.series('fonts'));
    gulp.watch(cfg.copyFiles.map((copySpec) => copySpec.src), gulp.series('copyFiles'));
    gulp.watch(cfg.src.bowerLinks, gulp.series('build'));
    gulp.watch(cfg.src.i18n, gulp.series('i18n'));

    gulp.watch([
      cfg.src.scripts,
      cfg.src.templates,
    ], debounce(gulp.series('scripts'), 200));

    if (cfg.env.maven) {
      gulp.watch(cfg.src.indexHtml, gulp.series('bsInject'));
    } else {
      gulp.watch(cfg.src.indexHtml, gulp.series('dev'));
    }
  }

  gulp.task(bsInject);
  gulp.task(bsServerSync);
  gulp.task(bsServerSyncDist);
  gulp.task(build);
  gulp.task(buildDist);
  gulp.task(clean);
  gulp.task(copyFiles);
  gulp.task(dev);
  gulp.task(dist);
  gulp.task(fonts);
  gulp.task(i18n);
  gulp.task(images);
  gulp.task(scripts);
  gulp.task(serve);
  gulp.task(serveDist);
  gulp.task(testSingleRun);
  gulp.task(startKarma);
  gulp.task(styles);
  gulp.task(symlinkDependencies);
  gulp.task(test);
  gulp.task(unlinkDependencies);
  gulp.task('watch', gulp.parallel(startKarma, watchForChanges));
}

module.exports.buildTasks = buildTasks;
module.exports.buildConfig = buildConfig;
