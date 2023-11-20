/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { CmsRequestActions } from '../../constants/enums/cms-actions.enum';
import { Subsystems } from '../../constants/enums/subsystems.enum';
import { FileSystemObjectTypes } from '../../constants/enums/file-system-object-types.enum';
import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';

interface BaseCmsRequest {
  s: Subsystems;
  r: CmsRequestActions;
  l: SupportedLanguages;
}

export interface ViewRequest extends BaseCmsRequest {
  path: string;
}

export interface CreateRequest extends BaseCmsRequest {
  path: string;
  type: FileSystemObjectTypes;
  fileName: string;
}

export interface UploadRequest extends BaseCmsRequest {
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

export interface UploadHexRequest extends BaseCmsRequest {
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

export interface MoveCopyRequest extends BaseCmsRequest {
  from: string;
  to: string;
}

export interface DeleteRequest extends BaseCmsRequest {
  path: string;
}

export interface DownloadTicketRequest extends BaseCmsRequest {
  path: string;
}

export interface DownloadRequest extends BaseCmsRequest {
  ticket: string;
}
