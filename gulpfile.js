var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('compress', function () {
  return gulp.src('src/tag.js')
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('move', function () {
  return gulp.src('src/tag.js')
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['compress', 'move']);
