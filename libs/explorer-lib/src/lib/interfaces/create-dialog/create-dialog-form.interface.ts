/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FormControl } from '@angular/forms';
import { CreateDialogReturnData } from './create-dialog-return-data.interface';

export interface CreateDialogForm {
  name: FormControl<CreateDialogReturnData['name']>;
  securityLevel: FormControl<CreateDialogReturnData['securityLevel']>;
  description: FormControl<CreateDialogReturnData['description']>;
}
