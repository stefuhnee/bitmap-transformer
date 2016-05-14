'use strict';

const fs = require('fs');
const mocha = require('mocha');
const expect = require('chai').expect;
const transform = require('../transform')

describe('Bitmap read tests', () => {
  let bitmap = {};
  before((done) => {
    fs.readFile(__dirname + '/../palette-bitmap.bmp', (err, data) => {
      bitmap.buffer = data;
      done();
    });
  });
  it('should read the bitmap and return a buffer', () => {
    expect(Buffer.isBuffer(bitmap.buffer)).to.eql(true);
  });
  it()
})

describe('Bitmap pixel transform tests')

// all parts of the buffer should be the expected length
// header should be the same between data and the beginning of written buffer array
// function should alter every number but the 4th in series
