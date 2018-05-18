let gulp = require('gulp')
let stylus = require('gulp-stylus')
let electron = require('electron-connect').server.create()
let plumber = require('gulp-plumber')

gulp.task('style', function() {
  return gulp.src('app/styles/master.styl')
    .pipe(plumber())
    .pipe(stylus())
    .pipe(gulp.dest('app/styles/'))
})

gulp.task('default', ['style'], function () {
  electron.start()
  gulp.watch('./main.js', electron.restart)
  gulp.watch(['app/renderer.js', './index.html'], electron.reload)
  gulp.watch('./app/styles/**/*.styl', ['style', electron.reload])
  gulp.watch('./app/views/**/*.pug', electron.reload)
})