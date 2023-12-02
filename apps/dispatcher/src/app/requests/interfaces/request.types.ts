/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DispatcherQueryTypes } from '@eustrosoft-front/core';

export type RequestsForm = {
  forms: FormArray<FormGroup<SingleRequestForm>>;
  submit: FormControl<boolean | null>;
};

export type SingleRequestForm = {
  request: FormControl<string | null>;
  file: FormControl<File[] | null>;
  queryType: FormControl<DispatcherQueryTypes | null>;
};
