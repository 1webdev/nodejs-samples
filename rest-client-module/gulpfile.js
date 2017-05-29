'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    babel = require('gulp-babel'),
    merge = require('merge-stream'),
    istanbul = require('gulp-istanbul');


function handle(error) {
    /* jslint validthis:true */
    console.error(error.toString());
    this.emit('end');
}


gulp.task('scripts-es6', function() {
    var srcStream = gulp.src('src/**/*.js')
        .pipe(babel({ presets:['es2015'] }))
        .pipe(gulp.dest('es5/src'));

    var indexStream = gulp.src('index.js')
        .pipe(babel({ presets:['es2015'] }))
        .pipe(gulp.dest('es5'));

    return merge(srcStream, indexStream);
});


gulp.task('lint', function() {
    return gulp.src([
            'gulpfile.js',
            'src/**/*.js',
        ])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .on('error', handle);
});

gulp.task('lint-tests', function() {
    return gulp.src('test/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .on('error', handle);
});

gulp.task('test', ['lint'], function(cb) {
    gulp.src([
        'index.js',
        'src/**/*.js',
    ])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('error', handle)
        .on('finish', function() {
            gulp.src('test/**/*.js')
                .pipe(mocha({ reporter: 'list' }))
                .on('error', handle)
                .pipe(istanbul.writeReports())
                .on('end', cb);
        });
});

gulp.task('tr-test', function() {
    gulp.src('test/**/*.js')
        .pipe(mocha({ reporter: 'list' }));
});

gulp.task('watch', ['test'], function() {
    // Linting tasks
    gulp.watch([
        'gulpfile.js',
        'src/**/*.js',
    ], ['lint']);

    // gulp.watch('test/**/*.js', ['lint-tests']);

    // Tests
    gulp.watch([
        'test/**/*.js',
        'src/**/*.js',
    ], ['test']);

    // Building
    gulp.watch([
        'src/**/*.js',
    ], ['scripts-es6']);
});

gulp.task('build', ['scripts-es6']);

gulp.task('default', ['watch']);
