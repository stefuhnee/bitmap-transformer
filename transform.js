'use strict';

const fs = require('fs');

const bitmap = {};

// Inverts RGB colors (excluding alpha) & converts to hex
function invertColors(palette, cb, data) {
  for (var i = 0; i < palette.length; i++){
    if (!(i % 4 === 3)) palette[i] = 256 - palette[i];
    palette[i] = palette[i].toString(16);
  }
  console.log('palette after inversion and hexing', palette)
  cb(bitmap.colorPaletteRaw, data, writeNewBitmap);
}

// Concatenates buffer strings and converts back to buffer.
function constructBitmap(palette, data, cb) {
  let paletteString = palette.join('');
  let buf = '';
  let bufHeader = data.toString('hex', 0, 54);
  let bufPixels = data.toString('hex', 1078);
  buf += bufHeader + paletteString + bufPixels;
  let finalBuffer = new Buffer(buf, 'hex');
  cb(finalBuffer);
}

// Constructs and writes new bitmap
function writeNewBitmap(buffer) {
  fs.writeFile(__dirname + '/palette-bitmap-new.bmp', buffer, (err) => {
    if (err) console.log(err);
    console.log('bitmap successful');
  })
}

// Reads bitmap and converts palette to an array of bytes
function readBitmap(cb) {
  fs.readFile(__dirname + '/palette-bitmap.bmp', (err, data) => {
    if (err) console.log(err);
    console.log('headers', data.slice(0, 54));
    bitmap.type = data.toString('ascii', 0, 2);
    bitmap.size = data.readUInt32LE(2);
    bitmap.start = data.readUInt32LE(10);
    bitmap.sizeOfHeader = data.readUInt32LE(14);
    bitmap.bitsPerPixel = data.readUInt16LE(28);
    bitmap.colorPaletteNum = data.readUInt32LE(46);
    bitmap.colorPaletteRaw =
    data.toString('hex', 54, 1078).match(/.{1,2}/g).map((hexValue) => {
      return parseInt(hexValue, 16);
    });
    cb(bitmap.colorPaletteRaw, constructBitmap, data);
  })
}

readBitmap(invertColors);
