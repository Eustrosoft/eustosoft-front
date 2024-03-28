/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { BaseFsResponse } from './base-fs-response.interface';
import { FsObject } from './fs-object.interface';

export interface FsViewResponse extends BaseFsResponse {
  content: FsObject[];
  e: number;
  m: string;
}

// export interface CreateResponse extends BaseExplorerResponse {
//   e: number;
//   m: string;
// }
//
// export interface MoveResponse extends BaseExplorerResponse {
//   e: number;
//   m: string;
// }
//
// export interface MoveCopyResponse extends BaseExplorerResponse {
//   e: number;
//   m: string;
// }
//
// export interface DeleteResponse extends BaseExplorerResponse {
//   e: number;
//   m: string;
// }
//
// export interface DownloadTicketResponse extends BaseExplorerResponse {
//   e: number;
//   m: string;
// }
//
// export interface UploadResponse extends BaseExplorerResponse {
//   e: number;
//   m: string;
// }
