import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { APP_ENVIRONMENT, Environment } from '@eustrosoft-front/app-config';
import {
  PingRequest,
  PingResponse,
  QtisRequestResponseInterface,
  Subsystems,
  SupportedLanguages,
} from '@eustrosoft-front/core';

@Injectable()
export class AuthenticationService {
  private http = inject(HttpClient);
  private environment: Environment = inject(APP_ENVIRONMENT);

  isAuthenticated = new BehaviorSubject<boolean>(false);
  userName = new BehaviorSubject<string>('');

  getAuthenticationInfo(): Observable<
    QtisRequestResponseInterface<PingResponse>
  > {
    return this.http
      .post<QtisRequestResponseInterface<PingResponse>>(
        `${this.environment.apiUrl}/dispatch`,
        {
          r: [
            {
              s: Subsystems.PING,
              l: SupportedLanguages.EN_US,
            },
          ],
          t: 0,
        } as QtisRequestResponseInterface<PingRequest>
      )
      .pipe(
        tap((response) => {
          this.userName.next(response.r[0].fullName);
        })
      );
  }
}
