import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TisRequest, TisResponse } from '@eustrosoft-front/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class RequestService {
  constructor(private http: HttpClient) {}

  dispatch(query: TisRequest): Observable<TisResponse> {
    return this.http.post<TisResponse>(
      `${environment.apiUrl}/api/dispatch`,
      query
    );
  }
}
