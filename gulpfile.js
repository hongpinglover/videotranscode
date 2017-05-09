var gulp = require('gulp');
var browserSync = require('browser-sync').create();

gulp.task('connect',function(){
  browserSync.init({
      server:{
          baseDir:"./src"
      }
  })
});

gulp.task('js',function() {
    gulp.src('src/js/*.js')
        .pipe(gulp.dest('dist/js/'))
});

gulp.task('css',function() {
    gulp.src('src/css/*.css')
        .pipe(gulp.dest('dist/css/'))
});

gulp.task('html',function() {
    gulp.src('src/*.html')
        .pipe(gulp.dest('dist/'))
});

gulp.task('build',['js','css','html']);

gulp.task('watch', function(){
    gulp.watch('src/*.html',function(){
        browserSync.reload();
    });
    gulp.watch('src/js/*.js',function(){
        browserSync.reload();
    });
    gulp.watch('src/css/*.css',function(){
        browserSync.reload();
    });
});

gulp.task('default',['connect','watch']);
