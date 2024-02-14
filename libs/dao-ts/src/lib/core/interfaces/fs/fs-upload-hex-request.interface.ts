/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { BaseFsRequest } from './base-fs-request.interface';

export interface FsUploadHexRequest extends BaseFsRequest {
  parameters: {
    hexString: string;
    name: string;
    ext: string;
    chunk: number;
    all_chunks: number;
    hash: string;
    path: string;
    securityLevel?: number;
    description?: string;
  };
}
