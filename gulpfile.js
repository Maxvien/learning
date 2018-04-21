const fs = require('fs');
const path = require('path');

var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var insert = require('gulp-insert');
var inject = require('gulp-inject-string');
var indent = require("gulp-indent");
var tap = require("gulp-tap");
const bufferReplace = require('buffer-replace');
const gulpStylelint = require('gulp-stylelint');
const blocksDir = 'src/blocks';

gulp.task('scripts', function () {

    const blocks = fs.readdirSync(blocksDir)
        .filter(item => fs.lstatSync(path.join(blocksDir, item)).isDirectory())
        .map(block => path.join(blocksDir, block, `${block}.js`));

    return gulp.src(blocks)
        .pipe(sourcemaps.init())
        .pipe(indent({
            tabs: false,
            amount: 2
        }))
        .pipe(insert.prepend('$( ${block} ).exists( function() {\n'))
        .pipe(insert.append('\n});'))
        .pipe(tap(function (file, t) {

            const block = `'.${path.basename(file.path).replace(path.extname(file.path), '')}'`;

            file.contents = bufferReplace(Buffer(file.contents), '${block}', block);
        }))
        .pipe(concat('blocks.js', { newLine: '\n\n' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/assets'));
});

gulp.task('styles', function () {

    const blocks = fs.readdirSync(blocksDir)
        .filter(item => fs.lstatSync(path.join(blocksDir, item)).isDirectory())
        .map(block => path.join(blocksDir, block, `${block}.scss`));


    return gulp.src(blocks)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(concat('blocks.css', { newLine: '\n' }))
        .pipe(gulpStylelint({
            reporters: [
                { formatter: 'string', console: true }
            ]
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/assets'));
});