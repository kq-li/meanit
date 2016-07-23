var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var es = require('event-stream');

var lessPath = './public/less/*.less';
var lessDest = './public/dist/';

gulp.task('default', function () {});

gulp.task('less', function() {
  return gulp.src(lessPath)
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(gulp.dest(lessDest));
});

gulp.task('watch', function () {
  gulp.watch([lessPath], ['less']);
});
