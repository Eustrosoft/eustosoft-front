/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { Config } from '../interfaces/config.interface';
import { APP_BASE_HREF } from '@angular/common';

@Injectable()
export class ConfigService {
  private http: HttpClient = inject(HttpClient);
  private appBaseHref = inject(APP_BASE_HREF);
  private configUrl = `${window.location.origin}${
    this.appBaseHref
  }config.json?${Date.now()}`;
  private backupConfigUrl = `${
    window.location.origin
  }/config.json?${Date.now()}`;

  private mainConfig = this.http.get<Config>(this.configUrl);
  private backupConfig = this.http.get<Config>(this.backupConfigUrl);
  getConfig(): Observable<Config> {
    return this.mainConfig.pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Failed to fetch configuration from the first URL:', err);
        return this.backupConfig.pipe(
          catchError((err: HttpErrorResponse) => {
            console.error(
              'Failed to fetch configuration from the second URL:',
              err
            );
            return throwError(
              () => `Unable to fetch configuration from ${err.url}`
            );
          })
        );
      }),
      shareReplay(1)
    );
  }
}
