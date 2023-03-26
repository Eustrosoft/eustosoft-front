import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { APP_ENVIRONMENT, Environment } from '@eustrosoft-front/app-config';

@Injectable()
export class LoginService {
  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    @Inject(APP_ENVIRONMENT) private appConfig: Environment
  ) {}

  login(username: string, password: string): Observable<HttpResponse<string>> {
    return this.http
      .post(
        `${this.appConfig.apiUrl}/login`,
        {
          username,
          password,
        },
        { observe: 'response', responseType: 'text' }
      )
      .pipe(
        tap((res) => {
          this.authenticationService.isAuthenticated.next(res.ok);
          localStorage.setItem('isAuthenticated', 'true');
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.appConfig.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.authenticationService.isAuthenticated.next(false);
        localStorage.setItem('isAuthenticated', 'false');
      })
    );
  }
}
