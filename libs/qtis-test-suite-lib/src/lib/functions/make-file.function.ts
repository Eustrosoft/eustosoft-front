/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { MimeTypes } from '@eustrosoft-front/core';

/**
 * Creates file from provided arguments
 * @param fileName
 * @param extension
 * @param mimeType
 * @param fillWithMockData - If true - fills file with ASCII values for 'A' to 'Z' cyclically
 * @param size - Size of file in bytes
 */
export function makeFile(
  fileName: string,
  extension: string,
  mimeType: MimeTypes,
  fillWithMockData = false,
  size: number = 1048576,
): File {
  const byteArray = new Uint8Array(size);
  if (fillWithMockData) {
    for (let i = 0; i < byteArray.length; i++) {
      byteArray[i] = 65 + (i % 26);
    }
  }
  const blob = new Blob([byteArray], { type: mimeType });
  return new File([blob], `${fileName}.${extension}`);
}
