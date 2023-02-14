import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { APP_ENVIRONMENT } from '@eustrosoft-front/app-config';
import { Environment } from '@eustrosoft-front/app-config';

@Injectable()
export class LoginService {
  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    @Inject(APP_ENVIRONMENT) private appConfig: Environment
  ) {}

  login(login: string, password: string): Observable<HttpResponse<object>> {
    return this.http
      .post(
        `${this.appConfig.apiUrl}/api/login`,
        {
          login,
          password,
        },
        { observe: 'response' }
      )
      .pipe(
        tap((res) => {
          this.authenticationService.isAuthenticated.next(res.ok);
          localStorage.setItem('isAuthenticated', 'true');
        })
      );
  }

  logout(): Observable<HttpResponse<object>> {
    return this.http
      .post(`${this.appConfig.apiUrl}/api/logout`, {}, { observe: 'response' })
      .pipe(
        tap(() => {
          localStorage.setItem('isAuthenticated', 'false');
          this.authenticationService.isAuthenticated.next(false);
        })
      );
  }
}
