/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export interface UploadItem {
  file: File;
  progress: number;
  state: string;
  cancelled: boolean;
  uploadPath: string;
  securityLevel?: number;
  description?: string;
}
