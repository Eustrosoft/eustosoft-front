import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  PingRequest,
  PingResponse,
  QtisRequestResponseInterface,
  Subsystems,
  SupportedLanguages,
} from '@eustrosoft-front/core';
import { APP_CONFIG } from '@eustrosoft-front/config';

@Injectable()
export class AuthenticationService {
  private http: HttpClient = inject(HttpClient);
  private config = inject(APP_CONFIG);

  isAuthenticated = new BehaviorSubject<boolean>(false);
  userName = new BehaviorSubject<string>('');

  getAuthenticationInfo(): Observable<
    QtisRequestResponseInterface<PingResponse>
  > {
    return this.config.pipe(
      switchMap((config) =>
        this.http.post<QtisRequestResponseInterface<PingResponse>>(
          `${config.apiUrl}/dispatch`,
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
      ),
      tap((response) => {
        this.userName.next(response.r[0].fullName);
      })
    );
  }
}
