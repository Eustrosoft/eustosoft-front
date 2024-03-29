/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Observable } from 'rxjs';
import { Option } from '@eustrosoft-front/common-ui';

export interface CreateChatDialogData {
  securityLevelOptions$: Observable<Option[]>;
  scopeOptions$: Observable<Option[]>;
}
