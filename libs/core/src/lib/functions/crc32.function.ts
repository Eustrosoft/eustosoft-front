/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { numberToHex } from './number-to-hex.function';

export function crc32(arr: Uint8Array | string): string {
  if (typeof arr === 'string') {
    arr = new TextEncoder().encode(arr);
  }
  let crc = -1,
    i,
    j,
    l,
    temp;
  const poly = 0xedb88320;

  for (i = 0, l = arr.length; i < l; i += 1) {
    temp = (crc ^ arr[i]) & 0xff;
    for (j = 0; j < 8; j += 1) {
      if ((temp & 1) === 1) {
        temp = (temp >>> 1) ^ poly;
      } else {
        temp = temp >>> 1;
      }
    }
    crc = (crc >>> 8) ^ temp;
  }

  return numberToHex(crc ^ -1);
}

// export function crc32(input: string | Uint8Array | Int8Array): string {
//   const table = new Uint32Array(256);
//   const polynomial = 0xedb88320;
//
//   for (let i = 0; i < 256; i++) {
//     let c = i;
//     for (let j = 0; j < 8; j++) {
//       if (c & 1) {
//         c = (c >>> 1) ^ polynomial;
//       } else {
//         c >>>= 1;
//       }
//     }
//     table[i] = c;
//   }
//
//   let crc = 0xffffffff;
//
//   if (typeof input === 'string') {
//     const utf8Encoder = new TextEncoder();
//     input = utf8Encoder.encode(input);
//   } else if (input instanceof Int8Array) {
//     input = new Uint8Array(input.buffer);
//   }
//
//   for (let i = 0; i < input.length; i++) {
//     const byte = input[i];
//     crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
//   }
//
//   crc ^= 0xffffffff;
//
//   const crcString = crc.toString(16).toUpperCase().padStart(8, '0');
//   return crcString;
// }
