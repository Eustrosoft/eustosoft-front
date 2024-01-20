/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ExplorerObjectResponse } from './explorer-object-response.interface';
import { Subsystems, SupportedLanguages } from '@eustrosoft-front/core';

interface BaseExplorerResponse {
  s: Subsystems;
  l: SupportedLanguages;
}

export interface ViewResponse extends BaseExplorerResponse {
  content: ExplorerObjectResponse[];
  e: number;
  m: string;
}

export interface CreateResponse extends BaseExplorerResponse {
  e: number;
  m: string;
}

export interface MoveResponse extends BaseExplorerResponse {
  e: number;
  m: string;
}

export interface MoveCopyResponse extends BaseExplorerResponse {
  e: number;
  m: string;
}

export interface DeleteResponse extends BaseExplorerResponse {
  e: number;
  m: string;
}

export interface DownloadTicketResponse extends BaseExplorerResponse {
  e: number;
  m: string;
}

export interface UploadResponse extends BaseExplorerResponse {
  e: number;
  m: string;
}
