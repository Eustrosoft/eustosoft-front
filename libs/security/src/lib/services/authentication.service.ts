import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { APP_ENVIRONMENT, Environment } from '@eustrosoft-front/app-config';
import {
  LoginRequestInterface,
  LoginResponseInterface,
  PingRequest,
  PingResponse,
  Subsystems,
  SupportedLanguages,
} from '@eustrosoft-front/core';

@Injectable()
export class AuthenticationService {
  private http = inject(HttpClient);
  private environment: Environment = inject(APP_ENVIRONMENT);

  isAuthenticated = new BehaviorSubject<boolean>(false);
  userName = new BehaviorSubject<string>('');

  getAuthenticationInfo(): Observable<LoginResponseInterface<PingResponse>> {
    return this.http
      .post<LoginResponseInterface<PingResponse>>(
        `${this.environment.apiUrl}/dispatch`,
        {
          r: [
            {
              s: Subsystems.PING,
              l: SupportedLanguages.EN_US,
            },
          ],
          t: 0,
        } as LoginRequestInterface<PingRequest>
      )
      .pipe(
        tap((response) => {
          this.userName.next(response.r[0].fullName);
        })
      );
  }
}
