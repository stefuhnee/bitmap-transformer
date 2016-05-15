'use strict';
const fs = require('fs');
module.exports = exports = {};
const bitmap = {};

// Inverts RGB colors (excluding alpha) & converts to hex
exports.invertColors = function(bitmap, cb) {
  let palette = bitmap.colorPaletteRaw;
  for (var i = 0; i < palette.length; i++) {
    if (!(i % 4 === 3)) palette[i] = 255 - palette[i];
    palette[i] = palette[i].toString(16);
  };
  console.log('new palette', palette)
  typeof cb == 'function' && cb(bitmap, exports.constructBitmap);
};

// exports.writePaletteBuffer = function(bitmap, cb) {
//   let palette = bitmap.colorPaletteRaw;
//   let buf = new Buffer(palette);
//   for (var i = 0; i < palette.length; i++) {
//     buf.write(palette[i], 0, 'hex');
//   }
//   console.log(buf);
//   typeof cb == 'function' && cb(bitmap, exports.constructBuffer);
// }

// Concatenates pieces of the original buffer with transformed palette to form new bitmap buffer
exports.constructBitmap = function(bitmap, cb) {
  let palette = bitmap.colorPaletteRaw;
  let rawBuffer = bitmap.rawBuffer;
  let buf = Buffer.concat([rawBuffer.slice(0, 54), palette.join(''), rawBuffer.slice(1078)], rawBuffer.length);
  console.log('old', rawBuffer.slice(54))
  console.log('new', buf.slice(54));
  typeof cb == 'function' && cb(buf);
};

// Writes new bitmap buffer
exports.writeNewBitmap = function(buffer) {
  fs.writeFile(__dirname + '/palette-bitmap-new.bmp', buffer, (err) => {
    if (err) console.log(err);
    console.log('bitmap transformed');
  });
};

// Reads bitmap and converts palette to an array of bytes
exports.readBitmap = function(cb) {
  fs.readFile(__dirname + '/palette-bitmap.bmp', (err, data) => {
    if (err) console.log(err);
    bitmap.type = data.toString('ascii', 0, 2);
    bitmap.size = data.readUInt32LE(2);
    bitmap.start = data.readUInt32LE(10);
    bitmap.sizeOfHeader = data.readUInt32LE(14);
    bitmap.bitsPerPixel = data.readUInt16LE(28);
    bitmap.colorPaletteNum = data.readUInt32LE(46);
    bitmap.colorPaletteRaw =
    data.toString('hex', 54, 1078).match(/.{1,2}/g).map((hexByte) => {
      return parseInt(hexByte, 16);
    });
    bitmap.rawBuffer = data;
    typeof cb == 'function' && cb(bitmap, exports.constructBitmap);
  });
};

exports.readBitmap(exports.invertColors);

debugger;
