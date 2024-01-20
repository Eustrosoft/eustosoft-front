/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Subsystems, SupportedLanguages } from '@eustrosoft-front/core';
import { ExplorerFsObjectTypes } from '../constants/enums/explorer-fs-object-types.enum';
import { ExplorerRequestActions } from '../constants/enums/explorer-actions.enum';

interface BaseExplorerRequest {
  s: Subsystems;
  r: ExplorerRequestActions;
  l: SupportedLanguages;
}

export interface ViewRequest extends BaseExplorerRequest {
  path: string;
}

export interface CreateRequest extends BaseExplorerRequest {
  path: string;
  type: ExplorerFsObjectTypes;
  fileName: string;
  description: string;
  securityLevel?: number;
}

export interface UploadRequest extends BaseExplorerRequest {
  parameters: {
    file: string;
    name: string;
    ext: string;
    chunk: number;
    all_chunks: number;
    hash: string;
    path: string;
  };
}

export interface UploadHexRequest extends BaseExplorerRequest {
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

export interface MoveRequest extends BaseExplorerRequest {
  from?: string;
  to: string;
  description?: string;
}

export interface MoveCopyRequest extends BaseExplorerRequest {
  from: string;
  to: string;
}

export interface DeleteRequest extends BaseExplorerRequest {
  path: string;
}

export interface DownloadTicketRequest extends BaseExplorerRequest {
  path: string;
}

export interface DownloadRequest extends BaseExplorerRequest {
  ticket: string;
}
