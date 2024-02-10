/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { catchError, delay, Observable, of, switchMap } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QtisRequestResponse } from '@eustrosoft-front/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PingResponse } from '@eustrosoft-front/login-lib';

export const authenticationGuard = (): Observable<UrlTree | boolean> => {
  const authenticationService: AuthenticationService = inject(
    AuthenticationService,
  );
  const snackBar: MatSnackBar = inject(MatSnackBar);
  const router: Router = inject(Router);

  // TODO локализация ошибок
  return authenticationService.getAuthenticationInfo().pipe(
    switchMap((pingResponse: QtisRequestResponse<PingResponse>) => {
      if (pingResponse.r[0].e !== 0) {
        snackBar.open('Authenticate in order to access this page', 'Close');
        return of(router.createUrlTree(['login'])).pipe(delay(2000));
      }
      authenticationService.isAuthenticated$.next(true);
      return of(true);
    }),
    catchError((err: HttpErrorResponse) => {
      snackBar.open(
        `${err.status} ${err.statusText} | Error text: ${err.error}`,
        'Close',
      );
      return of(false);
    }),
  );
};
