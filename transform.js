'use strict';

const fs = require('fs');
const bitmap = {};

// Inverts RGB colors (excluding alpha) & creates new transformed palette buffer.
exports.invertColors = function(bitmap, cb) {
  let type = bitmap.type;
  let currentHex;
  let originalBuffer = bitmap.originalBuffer = bitmap.rawBuffer.slice(54);
  if (type === 'palette') originalBuffer = bitmap.colorPaletteRaw;
  for (var i = 0; i < originalBuffer.length; i++) {
    originalBuffer.writeUInt8('0x' + currentHex, i);
    if (!(i % 4 === 3) && type === 'palette' || type === 'nonPalette') {
      originalBuffer.writeUInt8('0x', 255 - currentHex).toString(16);
    }
    // if (type === 'nonPalette') {
    //   currentHex = (255 - currentHex).toString(16);
    // }
    // transformed.writeUInt8('0x' + currentHex, i);
    // Handles black not being zero padded
    if (originalBuffer.readUInt8(i) == 15) {
      originalBuffer.writeUInt8('0x' + 'ff', i);
    }
  }
  typeof cb === 'function' && cb(bitmap, exports.writeNewBitmap);
  return transformed;
};

// Concatenates buffer strings to reconstruct final bitmap buffer
exports.constructBitmap = function(bitmap, cb) {
  let rawBuffer = bitmap.rawBuffer;
  let transformedBuffer;
  let transformed = bitmap.originalBuffer;
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

// Can change to palette-bitmap.bmp to non-palette-bitmap.bmp
exports.readBitmap(exports.invertColors, '/palette-bitmap.bmp');
