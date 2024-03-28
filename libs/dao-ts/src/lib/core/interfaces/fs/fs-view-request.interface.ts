/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { BaseFsRequest } from './base-fs-request.interface';

export interface FsViewRequest extends BaseFsRequest {
  path: string;
}

// export interface CreateRequest extends BaseFsRequest {
//   path: string;
//   type: ExplorerFsObjectTypes;
//   fileName: string;
//   description: string;
//   securityLevel?: number;
// }
//
// export interface UploadRequest extends BaseFsRequest {
//   parameters: {
//     file: string;
//     name: string;
//     ext: string;
//     chunk: number;
//     all_chunks: number;
//     hash: string;
//     path: string;
//   };
// }
//
// export interface UploadHexRequest extends BaseFsRequest {
//   parameters: {
//     hexString: string;
//     name: string;
//     ext: string;
//     chunk: number;
//     all_chunks: number;
//     hash: string;
//     path: string;
//     securityLevel?: number;
//     description?: string;
//   };
// }
//
// export interface MoveRequest extends BaseFsRequest {
//   from?: string;
//   to: string;
//   description?: string;
// }
//
// export interface MoveCopyRequest extends BaseFsRequest {
//   from: string;
//   to: string;
// }
//
// export interface DeleteRequest extends BaseFsRequest {
//   path: string;
// }
//
// export interface DownloadTicketRequest extends BaseFsRequest {
//   path: string;
// }
//
// export interface DownloadRequest extends BaseFsRequest {
//   ticket: string;
// }
