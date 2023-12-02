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
import { map, Observable } from 'rxjs';
import {
  DicValue,
  DicValuesResponse,
  QtisRequestResponseInterface,
  Scopes,
  UserAvailableScopesResponse,
} from '@eustrosoft-front/core';
import { Option } from '@eustrosoft-front/common-ui';
import { SamService } from '@eustrosoft-front/security';

@Injectable()
export class MsgDictionaryService {
  private dicService = inject(DicService);
  private samService = inject(SamService);
  private dicMapperService = inject(DicMapperService);

  getStatusOptions(): Observable<DicValue[]> {
    return this.dicService
      .getDicValues(Dictionaries.MSG_CHANNEL_STATUS)
      .pipe(
        map((response: QtisRequestResponseInterface<DicValuesResponse>) =>
          response.r.flatMap((r: DicValuesResponse) => r.values)
        )
      );
  }

  getSecurityLevelOptions(): Observable<Option[]> {
    return this.dicService.getMappedDicValues<Option>(
      Dictionaries.SLEVEL,
      this.dicMapperService.toOption
    );
  }

  getScopeOptions(): Observable<Option[]> {
    return this.samService.getUserAvailableScope(Scopes.MSGC).pipe(
      map(
        (response: QtisRequestResponseInterface<UserAvailableScopesResponse>) =>
          response.r.flatMap((r) => r.zsid)
      ),
      map((values) =>
        values.map((value) => ({
          value: value,
          displayText: value.toString(),
          disabled: false,
        }))
      )
    );
  }
}
