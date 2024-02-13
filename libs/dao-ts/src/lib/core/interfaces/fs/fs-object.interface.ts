/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FsObjectTypes } from '../../../constants/enums/fs-object-types.enum';

export interface FsObject {
  description: string;
  fileName: string;
  fullPath: string;
  securityLevel: number;
  space: number;
  type: FsObjectTypes;
  zoid: number;
}
