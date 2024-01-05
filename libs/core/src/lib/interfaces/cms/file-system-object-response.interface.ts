/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FileSystemObjectTypes } from '../../constants/enums/file-system-object-types.enum';

export interface FileSystemObjectResponse {
  description: string;
  fileName: string;
  fullPath: string;
  securityLevel: number;
  space: number;
  type: FileSystemObjectTypes;
  zoid: number;
}
