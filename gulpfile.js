var gulp = require('gulp');
var electron = require('electron-connect').server.create();

gulp.task('serve', function () {

  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch('main.js', electron.restart);

  // Reload renderer process
  gulp.watch(['renderer.js', 'index.html'], electron.reload);

  // Reload styles
  gulp.watch('./styles/**/*.*', electron.reload)

  // Reload views
  gulp.watch('./views/**/*.*', electron.reload)
});
