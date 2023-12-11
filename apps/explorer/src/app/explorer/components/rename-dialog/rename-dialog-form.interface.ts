/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { RenameDialogReturnData } from './rename-dialog-return-data.interface';
import { FormControl } from '@angular/forms';

export interface RenameDialogForm {
  name: FormControl<RenameDialogReturnData['name']>;
  description: FormControl<RenameDialogReturnData['description']>;
}
