/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UploadItemForm } from '@eustrosoft-front/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ExplorerUploadItemsService {
  private fb = inject(FormBuilder);
  uploadItems$ = new BehaviorSubject<FormArray<FormGroup<UploadItemForm>>>(
    this.fb.array<FormGroup<UploadItemForm>>([]),
  );
}
