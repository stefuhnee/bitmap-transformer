'use strict';

const fs = require('fs');
const mocha = require('mocha');
const expect = require('chai').expect;
const transform = require('../transform');
const originalBitmap = {};
const transformedBitmap = {};

function readBitmap(filepath, done) {
  fs.readFile(__dirname + filepath, (err, data) => {
    let bitmap = transformedBitmap;
    if (filepath === '/../palette-bitmap.bmp') bitmap = originalBitmap;
    bitmap.buffer = data;
    bitmap.size = data.readUInt32LE(2);
    bitmap.start = data.readUInt32LE(10);
    bitmap.sizeOfHeader = data.readUInt32LE(14);
    bitmap.completeHeader = data.slice(0, 54);
    bitmap.bitsPerPixel = data.readUInt16LE(28);
    bitmap.colorPaletteNum = data.readUInt32LE(46);
    bitmap.colorPaletteRaw = data.slice(54, 1078);
    bitmap.pixelData = data.slice(1078);
    done();
  });
}

function invertColors(palette) {
  for (var i = 0; i < palette.length; i++) {
    if (!(i % 4 === 3)) palette[i] = 255 - palette[i];
  }
  return palette;
}

describe('Bitmap read tests', () => {
  before((done) => {
    readBitmap('/../palette-bitmap.bmp', done);
  });
  it('should read the bitmap and return a buffer', () => {
    expect(Buffer.isBuffer(originalBitmap.buffer)).to.eql(true);
  });
  it('should have a size that corresponds to header information given about pixel data start position and overall size', () => {
    expect(originalBitmap.size - originalBitmap.start).to.eql(originalBitmap.buffer.slice(originalBitmap.start).length);
  });
});

describe('Bitmap pixel transform tests', () => {
  let sampleArray = [32, 44, 1, 4, 54, 1, 23, 2, 56, 32, 251, 31, 2, 0];
  let transformedArray = [223, 211, 254, 4, 201, 254, 232, 2, 199, 223, 4, 31, 253, 255];
  before(() => {
    let invertColors = function(palette) {
      for (var i = 0; i < palette.length; i++) {
        if (!(i % 4 === 3)) palette[i] = 255 - palette[i];
      }
      return palette;
    };
  });
  it('should transform every index but the 4th (alpha) in an array', () => {
    expect(invertColors(sampleArray)).to.eql(transformedArray);
  });
});

describe('Transformed bitmap construction tests', () => {
  before((done) => {
    readBitmap('/../palette-bitmap-new.bmp', done);
  });
  it('should have the characteristics that the original buffer headers dictate/be equivalent to the original bitmap beyond the palette', () => {
    expect(originalBitmap.size).to.eql(transformedBitmap.size);
    expect(originalBitmap.length).to.eql(transformedBitmap.length);
    expect(originalBitmap.completeHeader).to.eql(transformedBitmap.completeHeader);
    expect(originalBitmap.pixelData).to.eql(transformedBitmap.pixelData);
  });
  it('should have a different color palette than the original', () => {
    expect(originalBitmap.colorPaletteRaw).to.not.eql(transformedBitmap.colorPaletteRaw);
  });
  it('should have the same color palette as the original when the inversion is reversed', () => {
    let reinvertedBytes = new Buffer(1024);
    let originalBytes = new Buffer(1024);
    // Reversing the inversion by calling the inversion function a second time
    let reinvertedPalette = transform.invertColors(transformedBitmap, null);
    let originalPalette = originalBitmap.colorPaletteRaw;
    for (var i = 0; i < reinvertedPalette.length; i++) {
      originalBytes.writeUInt8('0x' + originalPalette.readUInt8(i).toString(16), i);
      reinvertedBytes.writeUInt8('0x' + reinvertedPalette.readUInt8(i).toString(16), i);
    }
    expect(originalBytes).to.eql(reinvertedBytes);
  });
});
