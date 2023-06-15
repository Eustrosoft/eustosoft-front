/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FileSystemObject } from './file-system-object.interface';
import { Subsystems } from '../../constants/enums/subsystems.enum';
import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';

interface BaseCmsResponse {
  s: Subsystems;
  l: SupportedLanguages;
}

export interface ViewResponse extends BaseCmsResponse {
  content: FileSystemObject[];
  e: number;
  m: string;
}

export interface CreateResponse extends BaseCmsResponse {
  e: number;
  m: string;
}

export interface MoveCopyResponse extends BaseCmsResponse {
  e: number;
  m: string;
}

export interface DeleteResponse extends BaseCmsResponse {
  e: number;
  m: string;
}

export interface DownloadTicketResponse extends BaseCmsResponse {
  e: number;
  m: string;
}

export interface UploadResponse extends BaseCmsResponse {
  e: number;
  m: string;
}
