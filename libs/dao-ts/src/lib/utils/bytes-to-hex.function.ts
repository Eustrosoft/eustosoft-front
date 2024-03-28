/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export function bytesToHexString(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => `0${(byte & 0xff).toString(16)}`.slice(-2))
    .join('');
}
