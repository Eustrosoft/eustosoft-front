import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChunkedFileRequest,
  CmsDownloadParams,
  QtisRequestResponseInterface,
  TisRequest,
  TisResponse,
  TisResponseBody,
  UploadResponse,
} from '@eustrosoft-front/core';
import { map, mergeMap, Observable, of, switchMap } from 'rxjs';
import { APP_CONFIG } from '@eustrosoft-front/config';

@Injectable()
export class ExplorerService {
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

  download(
    parameterValue: string,
    parameterName: CmsDownloadParams = CmsDownloadParams.TICKET
  ): Observable<string> {
    return this.config.pipe(
      map(
        (config) =>
          `${config.apiUrl}/download?${parameterName}=${parameterValue}`
      )
    );
  }

  upload(query: TisRequest): Observable<{
    request: TisRequest;
    response: TisResponse;
    totalChunks: number;
    currentChunk: number;
  }> {
    return this.config.pipe(
      switchMap((config) =>
        this.http.post<TisResponse>(`${config.apiUrl}/dispatch`, query).pipe(
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
        )
      )
    );
  }

  uploadChunks(
    body: FormData,
    headers: { [p: string]: string | string[] }
  ): Observable<QtisRequestResponseInterface<UploadResponse>> {
    return this.config.pipe(
      switchMap((config) =>
        this.http.post<QtisRequestResponseInterface<UploadResponse>>(
          `${config.apiUrl}/dispatch`,
          body,
          {
            headers: new HttpHeaders(headers),
          }
        )
      )
    );
  }
}
