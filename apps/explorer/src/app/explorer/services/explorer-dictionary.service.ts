/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import {
  DicMapperService,
  DicService,
  Dictionaries,
} from '@eustrosoft-front/dic';
import { Observable, shareReplay } from 'rxjs';
import { Option } from '@eustrosoft-front/common-ui';

@Injectable()
export class ExplorerDictionaryService {
  private dicService = inject(DicService);
  private dicMapperService = inject(DicMapperService);

  securityOptions$ = this.getSecurityLevelOptions().pipe(shareReplay(1));

  getSecurityLevelOptions(): Observable<Option[]> {
    return this.dicService.getMappedDicValues<Option>(
      Dictionaries.SLEVEL,
      this.dicMapperService.toOption,
    );
  }
}
