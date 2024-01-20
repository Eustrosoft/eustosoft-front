/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FormControl } from '@angular/forms';
import { UploadItem } from './upload-item.interface';
import { SecurityLevels } from '@eustrosoft-front/security';

export interface UploadItemForm {
  uploadItem: FormControl<UploadItem>;
  filename: FormControl<string>;
  description: FormControl<string | undefined>;
  securityLevel: FormControl<SecurityLevels | undefined>;
}
