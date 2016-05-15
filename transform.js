'use strict';
const fs = require('fs');
module.exports = exports = {};
const bitmap = {};

// Inverts RGB colors (excluding alpha) & creates new transformed palette buffer.
exports.invertColors = function(bitmap, cb) {
  let palette = bitmap.colorPaletteRaw;
  let transformedPalette = new Buffer(1024);
  let currentHex;
  bitmap.transformedPalette = transformedPalette;
  for (var i = 0; i < palette.length; i++) {
    currentHex = palette.readUInt8(i);
    if (!(i % 4 === 3)) currentHex = (255 - currentHex).toString(16);
    transformedPalette.writeUInt8('0x' + currentHex, i);
    // Handles black not being zero padded
    if (transformedPalette.readUInt8(i) == 15) transformedPalette.writeUInt8('0x' + 'ff', i);
  }
  typeof cb === 'function' && cb(bitmap, exports.writeNewBitmap);
  return transformedPalette;
};

// Concatenates buffer strings to reconstruct final bitmap buffer
exports.constructBitmap = function(bitmap, cb) {
  let rawBuffer = bitmap.rawBuffer;
  let paletteString = bitmap.transformedPalette;
  let transformedBuffer = Buffer.concat([rawBuffer.slice(0, 54), paletteString, rawBuffer.slice(1078)], rawBuffer.length);
  typeof cb === 'function' && cb(transformedBuffer);
};

// Writes new bitmap buffer
exports.writeNewBitmap = function(buffer) {
  fs.writeFile(__dirname + '/palette-bitmap-new.bmp', buffer, (err) => {
    if (err) throw err;
    console.log('bitmap transformed');
  });
  return buffer;
};

// Reads bitmap and converts palette to an array of bytes
exports.readBitmap = function(cb) {
  fs.readFile(__dirname + '/palette-bitmap.bmp', (err, data) => {
    if (err) throw err;
    bitmap.type = data.toString('ascii', 0, 2);
    bitmap.size = data.readUInt32LE(2);
    bitmap.start = data.readUInt32LE(10);
    bitmap.sizeOfHeader = data.readUInt32LE(14);
    bitmap.bitsPerPixel = data.readUInt16LE(28);
    bitmap.colorPaletteNum = data.readUInt32LE(46);
    bitmap.colorPaletteRaw = (new Buffer(data.slice(54, 1078)));
    bitmap.rawBuffer = data;
    typeof cb === 'function' && cb(bitmap, exports.constructBitmap);
  });
};

exports.readBitmap(exports.invertColors);
