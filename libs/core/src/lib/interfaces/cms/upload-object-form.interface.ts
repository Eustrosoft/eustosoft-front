/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FormControl } from '@angular/forms';
import { UploadObject } from './upload-object.interface';

export interface UploadObjectForm {
  uploadItem: FormControl<UploadObject['uploadItem']>;
  note: FormControl<UploadObject['note']>;
  accessLevel: FormControl<UploadObject['accessLevel']>;
}
