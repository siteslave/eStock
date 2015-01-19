var gulp = require('gulp'),
    jade = require('gulp-jade'),
    jshint = require('gulp-jshint'),
    watch = require('gulp-watch'),
    sass = require('gulp-sass');

/** Jade **/
gulp.task('jade', function () {
    return gulp.src('./src/**/*.jade')
        .pipe(jade())
        .pipe(gulp.dest('./app'));
});

/** JSHint **/
gulp.task('jshint', function () {
   return gulp.src('./src/**/*.js')
       .pipe(jshint())
       .pipe(jshint.reporter('default'))
       .pipe(gulp.dest('./app'));
});
///** LESS **/
//gulp.task('less', function () {
//   return gulp.src('./src/**/*.less')
//       .pipe(less())
//       .pipe(gulp.dest('./app'));
//});
/** SCSS **/
gulp.task('sass', function () {
    return gulp.src('./src/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./app'));
});
/** Watch **/
gulp.task('watch', function () {
    gulp.watch('./src/**/*.js', ['jshint']);
    gulp.watch('./src/**/*.jade', ['jade']);
    gulp.watch('./src/**/*.less', ['less']);
});

/** Default task **/
gulp.task('default', ['jshint', 'jade', 'sass', 'watch']);
