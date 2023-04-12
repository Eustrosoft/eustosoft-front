import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QtisRequestResponseInterface } from '@eustrosoft-front/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class RequestService {
  constructor(private http: HttpClient) {}

  dispatch<Req, Res>(
    body: QtisRequestResponseInterface<Req>
  ): Observable<QtisRequestResponseInterface<Res>> {
    return this.http.post<QtisRequestResponseInterface<Res>>(
      `${environment.apiUrl}/dispatch`,
      body
    );
  }
}
