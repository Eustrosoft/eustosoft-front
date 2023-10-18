/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FormArray, FormControl } from '@angular/forms';

export type StatusFilterForm = {
  checkboxes: FormArray<FormControl<boolean>>;
};