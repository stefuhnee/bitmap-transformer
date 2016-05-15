'use strict';
const fs = require('fs');
module.exports = exports = {};
const bitmap = {};

function findInverse(hexByte) {
  let invertedByte = '';
  let map='0123456789abcdef';
  let inverseMap='fedcba9876543210';
  let char = '';
  for (var i = 0; i < hexByte.length; i++) {
    char = hexByte.charAt(i);
    for(var j = 0; j < map.length; j++) {
      if (char == map.charAt(j)) invertedByte += inverseMap.charAt(j);
    }
  }
  return invertedByte;
}

// Inverts RGB colors (excluding alpha) & converts to hex
exports.invertColors = function(bitmap, cb) {
  let palette = bitmap.colorPaletteRaw;
  let transformedPalette = new Buffer(1024);
  bitmap.transformedPalette = transformedPalette;
  console.log(transformedPalette);
  for (var i = 0; i < palette.length; i++) {
    if (!(i % 4 === 3)) {
      let currentHex = palette.readUInt8(i).toString(16);
      transformedPalette.writeUInt8('0x' + findInverse(currentHex), i);
    }
  }
  console.log('inverted palette', palette)
  typeof cb === 'function' && cb(bitmap, exports.writeNewBitmap);
};

// Concatenates buffer strings and converts back to buffer.
exports.constructBitmap = function(bitmap, cb) {
  let rawBuffer = bitmap.rawBuffer;
  let paletteString = bitmap.transformedPalette;
  let buf = Buffer.concat([rawBuffer.slice(0, 54), paletteString, rawBuffer.slice(1078)], rawBuffer.length);
  typeof cb === 'function' && cb(buf);
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
    console.log('original palette', bitmap.colorPaletteRaw);
    typeof cb === 'function' && cb(bitmap, exports.constructBitmap);
  });
};

exports.readBitmap(exports.invertColors);
