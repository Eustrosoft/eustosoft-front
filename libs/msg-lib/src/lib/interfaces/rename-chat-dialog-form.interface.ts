/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FormControl } from '@angular/forms';
import { RenameChatDialogReturnData } from './rename-chat-dialog-return-data.interface';

type FormControls<T> = {
  [K in keyof T]: FormControl<T[K]>;
};

export type RenameChatDialogForm = FormControls<RenameChatDialogReturnData>;
