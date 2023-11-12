/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UploadObject, UploadObjectForm } from '@eustrosoft-front/core';

@Injectable()
export class ExplorerUploadItemFormFactoryService {
  private fb: FormBuilder = inject(FormBuilder);
  makeNewUploadObjectForm(
    uploadObject: UploadObject
  ): FormGroup<UploadObjectForm> {
    return this.fb.group<UploadObjectForm>({
      uploadItem: this.fb.nonNullable.control(uploadObject.uploadItem),
      note: this.fb.nonNullable.control(uploadObject.note),
      accessLevel: this.fb.nonNullable.control(uploadObject.accessLevel),
    });
  }
}
