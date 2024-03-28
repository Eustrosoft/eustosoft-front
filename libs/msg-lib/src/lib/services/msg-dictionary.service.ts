/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import {
  DicService,
  Dictionaries,
  DicValue,
  DicValuesResponse,
} from '@eustrosoft-front/dic';
import { map, Observable, shareReplay } from 'rxjs';
import { QtisRequestResponse } from '@eustrosoft-front/core';

@Injectable({ providedIn: 'root' })
export class MsgDictionaryService {
  private readonly dicService = inject(DicService);

  msgStatusOptions$ = this.getStatusOptions().pipe(shareReplay(1));

  private getStatusOptions(): Observable<DicValue[]> {
    return this.dicService
      .getDicValues(Dictionaries.MSG_CHANNEL_STATUS)
      .pipe(
        map((response: QtisRequestResponse<DicValuesResponse>) =>
          response.r.flatMap((r: DicValuesResponse) => r.values),
        ),
      );
  }
}
