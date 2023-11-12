/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Observable } from 'rxjs';
import { Option } from '@eustrosoft-front/common-ui';

export interface CreateChatDialogDataInterface {
  title: string;
  subjectInputLabel: string;
  messageInputLabel: string;
  cancelButtonText: string;
  submitButtonText: string;
  securityLevelOptions$: Observable<Option[]>;
  scopeOptions$: Observable<Option[]>;
}
