/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FormControl } from '@angular/forms';

export interface TestDataFormInterface {
  showResponses: FormControl<boolean>;
  login: FormControl<string>;
  password: FormControl<string>;
  folderForTests: FormControl<string>;
  folderSecurityLevel: FormControl<number>;
  folderDescription: FormControl<string>;
  fileName: FormControl<string>;
  fileSecurityLevel: FormControl<number>;
  fileDescription: FormControl<string>;
  files: FormControl<File[]>;
  chatName: FormControl<string>;
  chatInitialMessage: FormControl<string>;
  chatScopeId: FormControl<number>;
  chatSecurityLevel: FormControl<number>;
}
