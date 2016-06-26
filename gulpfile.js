var gulp = require('gulp');
var pug = require('gulp-pug');

gulp.task('default', function () {});

gulp.task('views', function buildHTML() {
  return gulp.src('./*.pug')
    .pipe(pug())
    .pipe(gulp.dest('./'));
});
                                
