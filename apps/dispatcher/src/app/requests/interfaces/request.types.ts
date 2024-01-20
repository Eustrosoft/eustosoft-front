/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DispatcherQueryTypes } from '@eustrosoft-front/dispatcher-lib';

export type RequestsForm = {
  forms: FormArray<FormGroup<SingleRequestForm>>;
  submit: FormControl<boolean>;
};

export type SingleRequestForm = {
  request: FormControl<string>;
  file: FormControl<File[]>;
  queryType: FormControl<DispatcherQueryTypes>;
};
