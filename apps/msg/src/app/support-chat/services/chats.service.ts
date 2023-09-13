import { inject, Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { QtisRequestResponseInterface } from '@eustrosoft-front/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '@eustrosoft-front/config';

@Injectable()
export class ChatsService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  dispatch<Req, Res>(
    body: QtisRequestResponseInterface<Req>
  ): Observable<QtisRequestResponseInterface<Res>> {
    return this.config.pipe(
      switchMap((config) =>
        this.http.post<QtisRequestResponseInterface<Res>>(
          `${config.apiUrl}/dispatch`,
          body
        )
      )
    );
  }
}
