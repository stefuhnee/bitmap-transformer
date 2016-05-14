'use strict';

const fs = require('fs');
const buf = require('buffer');
const ee = new (require('events'));

const bitmap = {};

// Inverts RGB colors (excluding alpha)
function invertColors(palette, cb, data) {
  for (var i = 0; i < palette.length; i++){
    if (!(i % 4 === 3)) palette[i] = 256 - palette[i];
  }
  // console.log('palette after inversion', palette)
  cb(bitmap.colorPaletteRaw, data);
}

// Constructs and writes new bitmap
function writeNewBitmap(palette, data) {
  let paletteString = palette.join('');
  // console.log('palette string before converting to buffer', paletteString);
  // let buf = new Buffer(paletteString)
  fs.writeFile(__dirname + '/palette-bitmap-new.bmp', buf, (err) => {
    if (err) console.log(err);
    let buf = '';
    let bufHeader = data.slice(0, 54);
    // let
    console.log('buf header', bufHeader)
    let buf = new Buffer(data.toString('ascii', 0, 54))
    console.log('headers prior to buffer write', buf);
    buf.write(buf.toString('ascii', 0, 54));
    // console.log('buf', buf);
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
    data.toString('hex', 54, 1078).match(/.{1,2}/g).map((hex) => {
      return parseInt(hex, 16);
    });
    // console.log(bitmap);
    cb(bitmap.colorPaletteRaw, writeNewBitmap, data);
  })
}

readBitmap(invertColors);

debugger;


//color palette starts at index 54

// COLOR PALETTE STARTS AT BYTE 54, ends at BYTE 1074
// 2 hex characters = 1 byte
// Want to read 4 bytes at a time -- RGBA, each 1 byte.
// bitmap.colorPalette = data.toString('hex', 54, 1078);
