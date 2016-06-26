var gulp = require('gulp');
var pug = require('gulp-pug');
var less = require('gulp-less');
var path = require('path');
var es = require('event-stream');

gulp.task('default', function () {});

gulp.task('views', function buildHTML() {
  return es.merge(gulp.src('./*.pug').pipe(pug()),
                  gulp.src('./*.less').pipe(less({
                    paths: [path.join(__dirname, 'less', 'includes')]
                  }))).pipe(gulp.dest('./'));
});
                                
