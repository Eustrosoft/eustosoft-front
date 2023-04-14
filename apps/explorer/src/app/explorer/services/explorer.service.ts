import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import {
  ChunkedFileRequest,
  DownloadRequest,
  QtisRequestResponseInterface,
  TisRequest,
  TisResponse,
  TisResponseBody,
} from '@eustrosoft-front/core';
import { mergeMap, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ExplorerService {
  constructor(private http: HttpClient) {}

  dispatch<Req, Res>(
    body: QtisRequestResponseInterface<Req>
  ): Observable<QtisRequestResponseInterface<Res>> {
    return this.http.post<QtisRequestResponseInterface<Res>>(
      `${environment.apiUrl}/dispatch`,
      body
    );
  }

  download(
    body: QtisRequestResponseInterface<DownloadRequest>
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(`${environment.apiUrl}/dispatch`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  upload(query: TisRequest): Observable<{
    request: TisRequest;
    response: TisResponse;
    totalChunks: number;
    currentChunk: number;
  }> {
    return this.http
      .post<TisResponse>(`${environment.apiUrl}/dispatch`, query)
      .pipe(
        mergeMap((response: TisResponse) => {
          const req = query.requests[0] as ChunkedFileRequest;
          const res = response.responses[0] as TisResponseBody;
          const totalChunks = req.parameters.data.all_chunks;
          const currentChunk = req.parameters.data.chunk;
          return of({
            request: query,
            response: response,
            totalChunks,
            currentChunk,
          });
        })
      );
  }

  uploadChunks(
    body: FormData,
    headers: { [p: string]: string | string[] }
  ): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/dispatch`, body, {
      headers: new HttpHeaders(headers),
      observe: 'response',
    });
  }
}
