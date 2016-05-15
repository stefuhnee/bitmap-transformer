'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const lint = require('gulp-eslint');
const opts = {
  'extends': 'eslint:recommended',
  'ecmaFeatures': {
    'modules': true
  },
  'rules': {
    'no-alert': 0,
    'no-bitwise': 0,
    'camelcase': 1,
    'no-console': 1,
    'curly': 1,
    'eqeqeq': 0,
    'no-eq-null': 0,
    'guard-for-in': 1,
    'no-empty': 1,
    'no-use-before-define': 0,
    'no-obj-calls': 2,
    'no-unused-vars': 0,
    'new-cap': 1,
    'no-shadow': 0,
    'strict': 1,
    'no-invalid-regexp': 2,
    'comma-dangle': 2,
    'no-undef': 1,
    'no-new': 1,
    'no-extra-semi': 1,
    'no-debugger': 2,
    'no-caller': 1,
    'semi': 1,
    'quotes': 0,
    'no-unreachable': 2
  },
  'globals': {
    '$': false
  },
  'env': {
    'node': true,
    'es6': true
  }
};

gulp.task('linter' , () => {
  return gulp.src('../**/*.js')
    .pipe(lint(opts))
    .pipe(lint.format());
});

gulp.task('tests', () => {
  return gulp.src('./test/transform-test.js', {read: false})
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('watch', () => {
  gulp.watch('./test/transform-test.js', ['linter', 'tests']);
  gulp.watch('../**/*.js', ['linter']);
});

gulp.task('default', ['watch', 'linter', 'tests'], () => {
  console.log('All tasks completed successfully');
});
