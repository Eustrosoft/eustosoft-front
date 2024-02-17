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
  folderForTests: FormControl<string>;
  fileUploadPath: FormControl<string>;
  filename: FormControl<string>;
  folderSecurityLevel: FormControl<number>;
  folderDescription: FormControl<string>;
  files: FormControl<File[]>;
  showResponses: FormControl<boolean>;
}
