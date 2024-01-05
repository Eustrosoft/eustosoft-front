/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import {
  DicRequestActions,
  DicsRequest,
  DicsResponse,
  DicValue,
  DicValuesRequest,
  DicValuesResponse,
  DispatchService,
  QtisRequestResponseInterface,
  Subsystems,
  SupportedLanguages,
} from '@eustrosoft-front/core';
import { map, Observable } from 'rxjs';
import { Dictionaries } from '../contants/enums/dictionaries.enum';

@Injectable()
export class DicService {
  private dispatchService = inject(DispatchService);

  getDictionaries(): Observable<QtisRequestResponseInterface<DicsResponse>> {
    return this.dispatchService.dispatch<DicsRequest, DicsResponse>({
      r: [
        {
          s: Subsystems.DIC,
          r: DicRequestActions.DICTIONARIES,
          l: SupportedLanguages.EN_US,
        },
      ],
      t: 0,
    });
  }

  getDicValues(
    dic: Dictionaries,
  ): Observable<QtisRequestResponseInterface<DicValuesResponse>> {
    return this.dispatchService.dispatch<DicValuesRequest, DicValuesResponse>({
      r: [
        {
          s: Subsystems.DIC,
          r: DicRequestActions.VALUES,
          l: SupportedLanguages.EN_US,
          dic,
        },
      ],
      t: 0,
    });
  }

  getMappedDicValues<T>(
    dic: Dictionaries,
    mapFunc: (value: DicValue) => T,
  ): Observable<T[]> {
    return this.getDicValues(dic).pipe(
      map((response: QtisRequestResponseInterface<DicValuesResponse>) =>
        response.r.flatMap((r: DicValuesResponse) => r.values).map(mapFunc),
      ),
    );
  }
}
