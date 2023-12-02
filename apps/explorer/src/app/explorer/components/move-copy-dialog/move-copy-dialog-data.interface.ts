/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FileSystemObject } from '../../models/file-system-object.interface';

export interface MoveCopyDialogDataInterface {
  title: string;
  submitButtonText: string;
  cancelButtonText: string;
  fsObjects: FileSystemObject[];
}
