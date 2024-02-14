/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { BaseFsResponse } from './base-fs-response.interface';

export interface FsUploadHexResponse extends BaseFsResponse {
  e: number;
  m: string;
}
