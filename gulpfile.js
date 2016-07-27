var gulp = require('gulp');
var less = require('gulp-less');
var pug = require('gulp-pug');
var path = require('path');
var es = require('event-stream');

var lessPath = './public/less/*.less';
var lessDest = './public/dist/';
var pugPath = './views/*.pug';
var pugDest = './views/';

gulp.task('default', function () {});

gulp.task('less', function () {
  return gulp.src(lessPath)
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(gulp.dest(lessDest));
});

gulp.task('pug', function () {
  return gulp.src(pugPath)
    .pipe(pug())
    .pipe(gulp.dest(pugDest));
});

gulp.task('watch', function () {
  gulp.watch([lessPath], ['less']);
  gulp.watch([pugPath], ['pug']);
});
