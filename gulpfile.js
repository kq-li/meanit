var gulp = require('gulp');
var pug = require('gulp-pug');
var less = require('gulp-less');
var path = require('path');
var es = require('event-stream');

gulp.task('default', function () {});

gulp.task('pug', function () {
  return gulp.src('./*.pug')
    .pipe(pug())
    .pipe(gulp.dest('./'));
});

gulp.task('less', function() {
  return gulp.src('./*.less')
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('views', function () {
  return es.merge(
    gulp.src('./*.pug')
      .pipe(pug()),
    gulp.src('./*.less')
      .pipe(less({
        paths: [path.join(__dirname, 'less', 'includes')]
      })))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function () {
  gulp.watch(['./*.pug', './*.less'], ['views']);
});
