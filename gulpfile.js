var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var bourbon     = require("node-bourbon").includePaths;
var neat        = require("node-neat").includePaths;
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var htmlmin     = require('gulp-htmlmin');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    //browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['serve -s hire'], {stdio: 'inherit'})
        .on('close', done)
});


gulp.task('jekyll-watch', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done)
});

/**
 * Bundles JS
 */
 gulp.task('scripts', function(){
   return gulp.src([
     'src/js/vendor/**/*.js',
     'src/js/objects/**/*.js'
   ])
   .pipe(concat('bundle.js'))
   .pipe(uglify())
  //  .pipe(gulp.dest('static-assets/js'));
   .pipe(gulp.dest('static-assets/js'));
 });

 /**
  * Page Specific JS
  */
  gulp.task('page-scripts', function(){
    return gulp.src([
      'src/js/page/**/*.js',
      'src/js/utility/**/*.js'
    ])
    .pipe(uglify())
   //  .pipe(gulp.dest('static-assets/js'));
    .pipe(gulp.dest('static-assets/js'));
  });




/**
 * Minify HTML
 */
gulp.task('minify', function() {
  return gulp.src('_site/index.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('_site'));
});


/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-watch'], function () {

    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['jekyll-watch', 'sass-fast', 'scripts', 'page-scripts'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});


/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass-fast', function () {
    return gulp.src('src/sass/base-fast.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: ['scss'],
            includePaths: bourbon,
            includePaths: neat,
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 3 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('static-assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('_site/static-assets/css'));
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('critical', function () {
    return gulp.src('src/sass/critical/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: ['scss'],
            includePaths: bourbon,
            includePaths: neat,
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 3 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_includes/critical'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('_includes/critical'));
});


/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('src/**/*.scss', ['sass-fast', 'critical']);
    gulp.watch('src/js/**/*.js', ['scripts', 'page-scripts']);
    gulp.watch(['*.html','pages/*.html','src/js/**/*.js', 'src/sass/**/*.scss', '_layouts/*.html', '_includes/*.html', '_posts/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['critical', 'page-scripts', 'browser-sync', 'watch']);
