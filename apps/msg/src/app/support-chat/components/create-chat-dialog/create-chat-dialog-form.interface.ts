/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FormControl } from '@angular/forms';
import { CreateChatDialogReturnDataInterface } from './create-chat-dialog-return-data.interface';

type FormControls<T> = {
  [K in keyof T]: FormControl<T[K]>;
};

export type CreateChatDialogFormInterface =
  FormControls<CreateChatDialogReturnDataInterface>;
