/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Observable } from 'rxjs';

export interface ShareDialogData {
  shareLinkObs$: Observable<string>;
  shareOWikiLinkObs$: Observable<string>;
}
