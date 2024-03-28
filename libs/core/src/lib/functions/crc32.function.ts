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
