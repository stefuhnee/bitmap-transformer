'use strict';

const fs = require('fs');
const mocha = require('mocha');
const expect = require('chai').expect;
const transform = require('../transform');
const bitmap = {};
const transformedBitmap = {};

function readBitmap(filepath, done) {
  fs.readFile(__dirname + filepath, (err, data) => {
    let object = transformedBitmap;
    if (filepath === '/../palette-bitmap.bmp') object = bitmap;
    object.buffer = data;
    object.size = data.readUInt32LE(2);
    object.start = data.readUInt32LE(10);
    object.sizeOfHeader = data.readUInt32LE(14);
    object.completeHeader = data.slice(0, 54);
    object.bitsPerPixel = data.readUInt16LE(28);
    object.colorPaletteNum = data.readUInt32LE(46);
    object.colorPaletteRaw = data.slice(54, 1078);
    object.pixelData = data.slice(1078);
    done();
  });
}

describe('Bitmap read tests', () => {
  before((done) => {
    readBitmap('/../palette-bitmap.bmp', done);
  });
  it('should read the bitmap and return a buffer', () => {
    expect(Buffer.isBuffer(bitmap.buffer)).to.eql(true);
  });
  it('should have the correct size according to the header information', () => {
    expect(bitmap.size - bitmap.start).to.eql(bitmap.buffer.slice(bitmap.start).length);
  });
});

describe('Bitmap pixel transform tests', () => {
  let sampleArray = [32, 44, 1, 4, 54, 1, 23, 2, 56, 32, 251, 31, 2, 0];
  let invertColors = function(palette) {
    for (var i = 0; i < palette.length; i++) {
      if (!(i % 4 === 3)) palette[i] = 255 - palette[i];
    }
    console.log(palette)
    return palette;
  }

  it('should transform every index but the 4th (alpha) in an array', () => {
    expect(invertColors(sampleArray)).to.eql([223, 211, 254, 4, 201, 254, 232, 2, 199, 223, 4, 31, 253, 255]);
  });
});

describe('Transformed bitmap construction tests', () => {
  before((done) => {
    readBitmap('/../palette-bitmap-new.bmp', done);
  });
  it('should have the characteristics that the original buffer headers dictate/be equivalent to the original bitmap beyond the palette', () => {
    expect(bitmap.size).to.eql(transformedBitmap.size);
    expect(bitmap.length).to.eql(transformedBitmap.length);
    expect(bitmap.completeHeader).to.eql(transformedBitmap.completeHeader);
    expect(bitmap.pixelData).to.eql(transformedBitmap.pixelData);
  });
  it('should have a different color palette', () => {
    expect(bitmap.colorPaletteRaw).to.not.eql(transformedBitmap.colorPaletteRaw);
  });
});
