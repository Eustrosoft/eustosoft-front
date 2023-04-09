import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { APP_ENVIRONMENT, Environment } from '@eustrosoft-front/app-config';
import {
  LoginActions,
  LoginLogoutResponse,
  LoginRequest,
  LogoutRequest,
  QtisRequestResponseInterface,
  Subsystems,
  SupportedLanguages,
} from '@eustrosoft-front/core';

@Injectable()
export class LoginService {
  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    @Inject(APP_ENVIRONMENT) private environment: Environment
  ) {}

  login(
    login: string,
    password: string
  ): Observable<QtisRequestResponseInterface<LoginLogoutResponse>> {
    return this.http
      .post<QtisRequestResponseInterface<LoginLogoutResponse>>(
        `${this.environment.apiUrl}/dispatch`,
        {
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
        } as QtisRequestResponseInterface<LoginRequest>
      )
      .pipe(
        tap((v) => {
          this.authenticationService.isAuthenticated.next(v.r[0].e === 0);
        })
      );
  }

  logout(): Observable<QtisRequestResponseInterface<LoginLogoutResponse>> {
    return this.http
      .post<QtisRequestResponseInterface<LoginLogoutResponse>>(
        `${this.environment.apiUrl}/dispatch`,
        {
          r: [
            {
              s: Subsystems.LOGIN,
              r: LoginActions.LOGOUT,
              l: SupportedLanguages.EN_US,
            },
          ],
          t: 0,
        } as QtisRequestResponseInterface<LogoutRequest>
      )
      .pipe(
        tap(() => {
          this.authenticationService.isAuthenticated.next(false);
        })
      );
  }
}
