import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QtisRequestResponseInterface } from '@eustrosoft-front/core';
import { Observable, switchMap } from 'rxjs';
import { APP_CONFIG, Config } from '@eustrosoft-front/config';

@Injectable()
export class RequestService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  dispatch<Req, Res>(
    body: QtisRequestResponseInterface<Req>
  ): Observable<QtisRequestResponseInterface<Res>> {
    return this.config.pipe(
      switchMap((config: Config) =>
        this.http.post<QtisRequestResponseInterface<Res>>(
          `${config.apiUrl}/dispatch`,
          body
        )
      )
    );
  }
}
