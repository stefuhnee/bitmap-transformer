'use strict'

const arr = '3421414a423ffba425253252341342411';

// splits string into an array of 2 character string chunks.
const newArr = arr.match(/.{1,2}/g);

// changes hex values to equivalent decimal values
var decArray = newArr.map((hex) => {
  return parseInt(hex, 16);
})

console.log(decArray);

for (var i = 0; i < decArray.length; i++){
  if (!(i % 4 === 3)) decArray[i] = 256 - decArray[i];
}


console.log(decArray);
// const improvedArr = [];
//
// // slices into an array of 8 character chunks
// for (var i = 0; i < newArr.length; i+=8) {
//   let chunk = newArr.slice(i, i+8);
//   let color = [];
//   color.push(chunk.join(''));
//   improvedArr.push(color);
// }
//
// improvedArr.forEach((color) => {
//   console.log(color[0].slice(0,2));
// })
//
// console.log(improvedArr)

//index 0, 1 (8, 9... 16, 17...) red
//index 2, 3 (10, 11... 18, 19...) green
//index 4, 5 (12, 13... 20, 21...) blue
//index 6, 7 (14, 15... 22, 23... ) alpha
