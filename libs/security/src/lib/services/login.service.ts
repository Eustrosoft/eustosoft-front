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
    @Inject(APP_ENVIRONMENT) private environment: Environment
  ) {}

  login(login: string, password: string): Observable<HttpResponse<string>> {
    return this.http
      .post(
        `${this.environment.apiUrl}/login`,
        {
          login,
          password,
        },
        { observe: 'response', responseType: 'text' }
      )
      .pipe(
        tap((res: HttpResponse<string>) => {
          this.authenticationService.isAuthenticated.next(res.ok);
        })
      );
  }

  logout(): Observable<null> {
    return this.http.post<null>(`${this.environment.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.authenticationService.isAuthenticated.next(false);
      })
    );
  }
}
