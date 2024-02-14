/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export interface FsUploadItem {
  file: File;
  filename: string;
  securityLevel?: number;
  description?: string;
}
