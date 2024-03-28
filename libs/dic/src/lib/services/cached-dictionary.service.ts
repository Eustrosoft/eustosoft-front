/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { Option } from '@eustrosoft-front/common-ui';
import { DicMapperService } from './dic-mapper.service';
import { DicService } from './dic.service';
import { Dictionaries } from '../contants/enums/dictionaries.enum';
import {
  SamService,
  Scopes,
  UserAvailableScopesResponse,
} from '@eustrosoft-front/security';
import { QtisRequestResponse } from '@eustrosoft-front/core';

@Injectable({ providedIn: 'root' })
export class CachedDictionaryService {
  private readonly dicService = inject(DicService);
  private readonly dicMapperService = inject(DicMapperService);
  private readonly samService = inject(SamService);

  securityOptions$ = this.getSecurityLevelOptions().pipe(shareReplay(1));
  scopeOptions$ = this.getScopeOptions().pipe(shareReplay(1));

  private getSecurityLevelOptions(): Observable<Option[]> {
    return this.dicService.getMappedDicValues<Option>(
      Dictionaries.SLEVEL,
      this.dicMapperService.toOption,
    );
  }

  private getScopeOptions(): Observable<Option[]> {
    return this.samService.getUserAvailableScope(Scopes.MSGC).pipe(
      map((response: QtisRequestResponse<UserAvailableScopesResponse>) =>
        response.r.flatMap((r) => r.scopes),
      ),
      map((scopes) =>
        scopes.map((scope) => ({
          value: scope.ZSID,
          displayText: scope.name,
          disabled: false,
        })),
      ),
    );
  }
}
