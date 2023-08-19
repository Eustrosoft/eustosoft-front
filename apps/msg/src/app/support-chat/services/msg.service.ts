/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { QtisRequestResponseInterface } from '@eustrosoft-front/core';
import { Observable, switchMap } from 'rxjs';
import { APP_CONFIG } from '@eustrosoft-front/config';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class MsgService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  dispatch<Req, Res>(
    body: QtisRequestResponseInterface<Req>
  ): Observable<QtisRequestResponseInterface<Res>> {
    return this.config.pipe(
      switchMap((config) =>
        this.http.post<QtisRequestResponseInterface<Res>>(
          `${config.apiUrl}/dispatch`,
          body
        )
      )
    );
  }
}
