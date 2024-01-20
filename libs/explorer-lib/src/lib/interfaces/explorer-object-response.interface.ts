/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ExplorerFsObjectTypes } from '../constants/enums/explorer-fs-object-types.enum';

export interface ExplorerObjectResponse {
  description: string;
  fileName: string;
  fullPath: string;
  securityLevel: number;
  space: number;
  type: ExplorerFsObjectTypes;
  zoid: number;
}
