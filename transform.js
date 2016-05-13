'use strict';

const fs = require('fs');
const buf = require('buffer');
const ee = new (require('events'));

const bitmap = {};

// Inverts RGB colors (not including alpha)
function invertColors(palette, callback, data) {
  for (var i = 0; i < palette.length; i++){
    if (!(i % 4 === 3)) palette[i] = 256 - palette[i];
  }
  callback(bitmap.colorPaletteRaw, data);
}

function writeNewBitmap(palette, data) {
  palette.join('');
  let buf = new Buffer(palette, "hex");
  console.log('palette prior to buffer write', palette);
  fs.writeFile(__dirname + '/palette-bitmap.bmp', buf, (err) => {
    if (err) console.log(err);
  })
}

function readBitmap(callback) {
  fs.readFile(__dirname + '/palette-bitmap.bmp', (err, data) => {
    if (err) console.log(err);
    console.log('data', data);
    bitmap.type = data.toString('ascii', 0, 2);
    bitmap.size = data.readUInt32LE(2);
    bitmap.start = data.readUInt32LE(10);
    bitmap.sizeOfHeader = data.readUInt32LE(14);
    bitmap.bitsPerPixel = data.readUInt16LE(28);
    bitmap.colorPaletteNum = data.readUInt32LE(46);
    bitmap.colorPaletteRaw =
    data.toString('hex', 54, 1078).match(/.{1,2}/g).map((hex) => {
      return parseInt(hex, 16);
    });
    callback(bitmap.colorPaletteRaw, writeNewBitmap, data);
  })
}

readBitmap(invertColors);
// writeNewBitmap()

debugger;


//color palette starts at index 54

// COLOR PALETTE STARTS AT BYTE 54, ends at BYTE 1074
// 2 hex characters = 1 byte
// Want to read 4 bytes at a time -- RGBA, each 1 byte.
// bitmap.colorPalette = data.toString('hex', 54, 1078);
