/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SecurityLevels, UploadItemForm } from '@eustrosoft-front/core';
import { UploadItemState } from '../constants/enums/uploading-state.enum';

@Injectable()
export class ExplorerUploadItemFormFactoryService {
  private readonly fb: FormBuilder = inject(FormBuilder);

  makeUploadItemsForm(
    files: File[],
    uploadPath: string,
    defaultSecurityLevel: SecurityLevels,
  ): FormArray<FormGroup<UploadItemForm>> {
    return this.fb.array(
      files.map((file) =>
        this.fb.nonNullable.group<UploadItemForm>({
          uploadItem: this.fb.nonNullable.control({
            file,
            progress: 0,
            state: UploadItemState.PENDING,
            cancelled: false,
            uploadPath,
          }),
          filename: this.fb.nonNullable.control(file.name),
          description: this.fb.nonNullable.control(''),
          securityLevel: this.fb.nonNullable.control({
            value: defaultSecurityLevel,
            disabled: false,
          }),
        }),
      ),
    );
  }
}
