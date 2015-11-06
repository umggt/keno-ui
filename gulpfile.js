var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css');

gulp.task('copy-css', function () {
  return gulp.src(['./src/css/keno.css'])
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('copy-js', function () {
  return gulp.src(['./src/js/index.js'])
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('bundle-html', function () {
    var assets = useref.assets({ searchPath: './' });

    return gulp.src('./src/*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['copy-css', 'copy-js', 'bundle-html']);