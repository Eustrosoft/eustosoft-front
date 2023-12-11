/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Observable } from 'rxjs';

export interface ShareDialogDataInterface {
  linkObs$: Observable<{
    isLoading: boolean;
    isError: boolean;
    link: string | undefined;
  }>;
}
