/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FileSystemObject } from '@eustrosoft-front/explorer-lib';

export interface MoveCopyDialogData {
  title: string;
  cancelButtonText: string;
  submitButtonText: string;
  fsObjects: FileSystemObject[];
  defaultPath: string;
}
