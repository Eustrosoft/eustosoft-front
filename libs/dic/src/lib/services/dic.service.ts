/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { DispatchService } from '@eustrosoft-front/security';
import {
  DicRequestActions,
  DicsRequest,
  DicsResponse,
  DicValuesRequest,
  DicValuesResponse,
  QtisRequestResponseInterface,
  Subsystems,
  SupportedLanguages,
} from '@eustrosoft-front/core';
import { Observable } from 'rxjs';

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

  getDictionaryValues(
    dic: string
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
}
