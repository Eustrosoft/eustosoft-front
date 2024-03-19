/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import {
  DicMapperService,
  DicService,
  Dictionaries,
  DicValue,
  DicValuesResponse,
} from '@eustrosoft-front/dic';
import { map, Observable } from 'rxjs';
import { QtisRequestResponse } from '@eustrosoft-front/core';
import { Option } from '@eustrosoft-front/common-ui';
import {
  SamService,
  Scopes,
  UserAvailableScopesResponse,
} from '@eustrosoft-front/security';

@Injectable({ providedIn: 'root' })
export class MsgDictionaryService {
  private readonly dicService = inject(DicService);
  private readonly samService = inject(SamService);
  private readonly dicMapperService = inject(DicMapperService);

  getStatusOptions(): Observable<DicValue[]> {
    return this.dicService
      .getDicValues(Dictionaries.MSG_CHANNEL_STATUS)
      .pipe(
        map((response: QtisRequestResponse<DicValuesResponse>) =>
          response.r.flatMap((r: DicValuesResponse) => r.values),
        ),
      );
  }

  getSecurityLevelOptions(): Observable<Option[]> {
    return this.dicService.getMappedDicValues<Option>(
      Dictionaries.SLEVEL,
      this.dicMapperService.toOption,
    );
  }

  getScopeOptions(): Observable<Option[]> {
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
