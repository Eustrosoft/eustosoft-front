import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import {
  LoginActions,
  LoginLogoutResponse,
  LoginRequest,
  LogoutRequest,
  QtisRequestResponseInterface,
  Subsystems,
  SupportedLanguages,
} from '@eustrosoft-front/core';
import { APP_CONFIG } from '@eustrosoft-front/config';

@Injectable()
export class LoginService {
  private http: HttpClient = inject(HttpClient);
  private authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  private config = inject(APP_CONFIG);

  login(
    login: string,
    password: string
  ): Observable<QtisRequestResponseInterface<LoginLogoutResponse>> {
    return this.config.pipe(
      switchMap((config) =>
        this.http.post<QtisRequestResponseInterface<LoginLogoutResponse>>(
          `${config.apiUrl}/dispatch`,
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
      ),
      tap((v) => {
        this.authenticationService.isAuthenticated.next(v.r[0].e === 0);
      })
    );
  }

  logout(): Observable<QtisRequestResponseInterface<LoginLogoutResponse>> {
    return this.config.pipe(
      switchMap((config) =>
        this.http.post<QtisRequestResponseInterface<LoginLogoutResponse>>(
          `${config.apiUrl}/dispatch`,
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
      ),
      tap(() => {
        this.authenticationService.isAuthenticated.next(false);
      })
    );
  }
}
