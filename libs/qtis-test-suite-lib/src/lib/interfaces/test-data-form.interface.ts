/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FormControl } from '@angular/forms';

export interface TestDataFormInterface {
  login: FormControl<string>;
  password: FormControl<string>;
  fsListPath: FormControl<string>;
  fileUploadPath: FormControl<string>;
  filename: FormControl<string>;
  fileSecurityLevel: FormControl<string | undefined>;
  fileDescription: FormControl<string>;
  files: FormControl<File[]>;
}
