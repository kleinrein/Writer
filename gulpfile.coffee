gulp = require 'gulp'
stylus = require 'gulp-stylus'
electron = require('electron-connect').server.create()

# Compile stylus files
gulp.task 'css', ->
    gulp.src('app/styles/master.styl')
        .pipe(stylus())
        .pipe(gulp.dest('app/styles/'))

gulp.task('default', ['css'])

gulp.task 'serve', ->

    # Start browser process
    electron.start()

    # Restart browser process
    gulp.watch './main.js', electron.restart

    # Reload renderer process
    gulp.watch [
        './renderer.js'
        './index.html'
    ], electron.reload

    # Reload styles
    gulp.watch './styles/**/*.*', electron.reload

    # Reload views
    gulp.watch './views/**/*.*', electron.reload
