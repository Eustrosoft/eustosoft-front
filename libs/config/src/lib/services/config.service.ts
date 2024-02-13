/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  Observable,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';
import { Config } from '../interfaces/config.interface';
import { APP_BASE_HREF, DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly appBaseHref = inject(APP_BASE_HREF);
  private readonly document = inject(DOCUMENT);

  private readonly configUrl = `${this.document.location.origin}${
    this.appBaseHref
  }config.json?${Date.now()}`;

  private readonly backupConfigUrl = `${
    this.document.location.origin
  }/config.json?${Date.now()}`;

  private configSync = new BehaviorSubject<Config | undefined>(undefined);

  private mainConfig = this.http.get<Config>(this.configUrl).pipe(
    tap((cnf) => {
      this.configSync.next(cnf);
    }),
    shareReplay(1),
  );
  private backupConfig = this.http.get<Config>(this.backupConfigUrl).pipe(
    tap((cnf) => {
      this.configSync.next(cnf);
    }),
    shareReplay(1),
  );

  getConfig(): Observable<Config> {
    return this.mainConfig.pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Failed to fetch configuration from the first URL:', err);
        return this.backupConfig.pipe(
          catchError((err: HttpErrorResponse) => {
            console.error(
              'Failed to fetch configuration from the second URL:',
              err,
            );
            return throwError(
              () =>
                new HttpErrorResponse({
                  url: err.url ?? '',
                  error: `Unable to fetch configuration from ${err.url}`,
                  headers: err.headers,
                  status: err.status,
                  statusText: err.statusText,
                }),
            );
          }),
        );
      }),
    );
  }

  getConfigSync(): Config {
    const value = this.configSync.getValue();
    if (!value) {
      throw new Error('Config is undefined');
    }
    return value;
  }
}
