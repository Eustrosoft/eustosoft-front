/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FileSystemObjectTypes } from '../../constants/enums/file-system-object-types.enum';

export interface FileSystemObject {
  fileName: string;
  extension?: string;
  hash?: string;
  fullPath: string;
  links: Array<unknown>;
  space: number;
  modified: string;
  created: string;
  type: FileSystemObjectTypes;
}
