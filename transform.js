'use strict';

const fs = require('fs');
const bitmap = {};

// Reads bitmap and converts palette to an array of bytes
exports.readBitmap = function(cb, file) {
  fs.readFile(__dirname + file, (err, data) => {
    if (err) throw err;
    bitmap.size = data.readUInt32LE(2);
    bitmap.start = data.readUInt32LE(10);
    bitmap.sizeOfHeader = data.readUInt32LE(14);
    bitmap.colorPaletteNum = data.readUInt32LE(46);
    bitmap.type = 'nonPalette';
    if (bitmap.colorPaletteNum) {
      bitmap.type = 'palette';
      bitmap.colorPaletteRaw = data.slice(54, 1078);
    }
    bitmap.rawBuffer = data;
    typeof cb === 'function' && cb(bitmap, exports.constructBitmap);
  });
};

// Inverts RGB colors (excluding alpha) & creates new transformed palette buffer.
exports.invertColors = function(bitmap, cb) {
  let type = bitmap.type;
  let currentHex;
  let originalBuffer = bitmap.rawBuffer.slice(54);
  if (type === 'palette') originalBuffer = bitmap.colorPaletteRaw;
  let transformed = bitmap.transformed = new Buffer(originalBuffer.length);
  for (var i = 0; i < originalBuffer.length; i++) {
    currentHex = originalBuffer.readUInt8(i);
    if (!(i % 4 === 3) && type === 'palette' || type === 'nonPalette') {
      currentHex = (255 - currentHex).toString(16);
    }
    transformed.writeUInt8('0x' + currentHex, i);
    // Handles black not being zero padded
    if (transformed.readUInt8(i) == 15) {
      transformed.writeUInt8('0x' + 'ff', i);
    }
  }
  typeof cb === 'function' && cb(bitmap, exports.writeNewBitmap);
};

// Concatenates buffer strings to reconstruct final bitmap buffer
exports.constructBitmap = function(bitmap, cb) {
  let rawBuffer = bitmap.rawBuffer;
  let transformedBuffer;
  let transformed = bitmap.transformed;
  if (bitmap.type === 'palette') {
    transformedBuffer = Buffer.concat([rawBuffer.slice(0, 54), transformed, rawBuffer.slice(1078)], rawBuffer.length);
  } else {
    transformedBuffer = Buffer.concat([rawBuffer.slice(0, 54), bitmap.transformed], rawBuffer.length);
  }
  typeof cb === 'function' && cb(transformedBuffer);
};

// Writes new bitmap buffer
exports.writeNewBitmap = function(buffer) {
  fs.writeFile(__dirname + '/bitmap-new.bmp', buffer, (err) => {
    if (err) throw err;
    console.log('bitmap transformed');
  });
  return buffer;
};

// Can switch between palette-bitmap.bmp & non-palette-bitmap.bmp
exports.readBitmap(exports.invertColors, '/palette-bitmap.bmp');
