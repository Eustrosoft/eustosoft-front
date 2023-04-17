import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import {
  ChunkedFileRequest,
  CmsDownloadParams,
  QtisRequestResponseInterface,
  TisRequest,
  TisResponse,
  TisResponseBody,
  UploadResponse,
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
    parameterValue: string,
    parameterName: CmsDownloadParams = CmsDownloadParams.TICKET
  ): Observable<HttpEvent<Blob>> {
    return this.http.get(
      `${environment.apiUrl}/download?${parameterName}=${parameterValue}`,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
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
  ): Observable<QtisRequestResponseInterface<UploadResponse>> {
    // return of({
    //   r: [],
    //   t: 0,
    // }).pipe(delay(1000));
    return this.http.post<QtisRequestResponseInterface<UploadResponse>>(
      `${environment.apiUrl}/dispatch`,
      body,
      {
        headers: new HttpHeaders(headers),
      }
    );
  }
}
