/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { DicService, Dictionaries } from '@eustrosoft-front/dic';
import { map, Observable } from 'rxjs';
import {
  DicValue,
  DicValuesResponse,
  QtisRequestResponseInterface,
} from '@eustrosoft-front/core';
import { Option } from '@eustrosoft-front/common-ui';

@Injectable()
export class MsgDictionaryService {
  private dicService = inject(DicService);

  getStatusOptions(): Observable<DicValue[]> {
    return this.dicService
      .getDictionaryValues(Dictionaries.MSG_CHANNEL_STATUS)
      .pipe(
        map((response: QtisRequestResponseInterface<DicValuesResponse>) =>
          response.r.flatMap((r: DicValuesResponse) => r.values)
        )
      );
  }

  getSecurityLevelOptions(): Observable<Option[]> {
    return this.dicService.getDictionaryValues(Dictionaries.SLEVEL).pipe(
      map((response: QtisRequestResponseInterface<DicValuesResponse>) =>
        response.r.flatMap((r: DicValuesResponse) => r.values)
      ),
      map((values) =>
        values.map((value) => ({
          value: value.code,
          displayText: value.value,
          disabled: false,
        }))
      )
    );
  }
}
