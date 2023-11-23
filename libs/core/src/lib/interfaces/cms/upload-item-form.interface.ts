/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FormControl } from '@angular/forms';
import { UploadItem } from './upload-item.interface';

export interface UploadItemForm {
  uploadItem: FormControl<UploadItem>;
  description: FormControl<UploadItem['description']>;
  securityLevel: FormControl<UploadItem['securityLevel']>;
}
