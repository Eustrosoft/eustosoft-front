/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import {
  DispatchService,
  QtisRequestResponseInterface,
  Subsystems,
  SupportedLanguages,
} from '@eustrosoft-front/core';
import {
  LoginActions,
  LoginLogoutResponse,
  LoginRequest,
  LogoutRequest,
} from '@eustrosoft-front/login-lib';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly dispatchService = inject(DispatchService);

  login(
    login: string,
    password: string,
  ): Observable<QtisRequestResponseInterface<LoginLogoutResponse>> {
    return this.dispatchService
      .dispatch<LoginRequest, LoginLogoutResponse>({
        r: [
          {
            s: Subsystems.LOGIN,
            r: LoginActions.LOGIN,
            l: SupportedLanguages.EN_US,
            login,
            password,
          },
        ],
        t: 0,
      } as QtisRequestResponseInterface<LoginRequest>)
      .pipe(
        tap((v) => {
          this.authenticationService.isAuthenticated$.next(v.r[0].e === 0);
        }),
      );
  }

  logout(): Observable<QtisRequestResponseInterface<LoginLogoutResponse>> {
    return this.dispatchService
      .dispatch<LogoutRequest, LoginLogoutResponse>({
        r: [
          {
            s: Subsystems.LOGIN,
            r: LoginActions.LOGOUT,
            l: SupportedLanguages.EN_US,
          },
        ],
        t: 0,
      } as QtisRequestResponseInterface<LogoutRequest>)
      .pipe(
        tap(() => {
          this.authenticationService.isAuthenticated$.next(false);
        }),
      );
  }
}
