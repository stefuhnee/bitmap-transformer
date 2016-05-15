'use strict';

const fs = require('fs');
const mocha = require('mocha');
const expect = require('chai').expect;
const transform = require('../transform');

describe('Bitmap read tests', () => {
  let bitmap = {};
  before((done) => {
    fs.readFile(__dirname + '/../palette-bitmap.bmp', (err, data) => {
      bitmap.buffer = data;
      bitmap.size = data.readUInt32LE(2);
      bitmap.start = data.readUInt32LE(10);
      bitmap.sizeOfHeader = data.readUInt32LE(14);
      bitmap.bitsPerPixel = data.readUInt16LE(28);
      bitmap.colorPaletteNum = data.readUInt32LE(46);
      done();
    });
  });
  it('should read the bitmap and return a buffer', () => {
    expect(Buffer.isBuffer(bitmap.buffer)).to.eql(true);
  });
  it('should have the correct size according to the header information', () => {
    expect(bitmap.size - bitmap.start).to.eql(bitmap.buffer.slice(bitmap.start).length);
  });
});

describe('Bitmap pixel transform tests', () => {
  let bitmap = {};
  bitmap.colorPaletteRaw = [32, 44, 1, 4, 54, 3, 23, 2, 56, 32, 4, 32, 3, 0];
  it('should transform every index but the 4th (alpha) in an array', () => {
    expect(transform.invertColors(bitmap)).to.eql([224, 212, 255, 4, 202, 253, 233, 2, 200, 224, 252, 32, 253, 256]);
  });
})

// describe('Bitmap pixel transform tests')

// all parts of the buffer should be the expected length
// header should be the same between data and the beginning of written buffer array
// function should alter every number but the 4th in series
