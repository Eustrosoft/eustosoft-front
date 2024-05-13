/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import {
  catchError,
  combineLatest,
  delay,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

export const authenticationGuard = (): Observable<UrlTree | boolean> => {
  const authenticationService = inject(AuthenticationService);
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  // TODO Lyasrt локализация ошибок
  return combineLatest([
    authenticationService.pingRes$,
    authenticationService.userInfo$,
  ]).pipe(
    switchMap(([pingResponse]) => {
      if (pingResponse.r[0].e !== 0) {
        snackBar.open('Authenticate in order to access this page', 'close');
        return of(router.createUrlTree(['login'])).pipe(delay(2000));
      }
      authenticationService.isAuthenticated$.next(true);
      return of(true);
    }),
    catchError((err: HttpErrorResponse) => {
      snackBar.open(
        `${err.status} ${err.statusText} | Error text: ${err.error}`,
        'close',
      );
      return of(false);
    }),
  );
};
