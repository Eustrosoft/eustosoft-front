import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import {
  ChunkedFileRequest,
  CmsRequestInterface,
  CmsResponseInterface,
  TisRequest,
  TisResponse,
  TisResponseBody,
  ViewRequest,
  ViewResponse,
} from '@eustrosoft-front/core';
import { mergeMap, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ExplorerService {
  constructor(private http: HttpClient) {}

  dispatch<Req, Res>(
    body: CmsRequestInterface<Req>
  ): Observable<CmsResponseInterface<Res>> {
    return this.http.post<CmsResponseInterface<Res>>(
      `${environment.apiUrl}/dispatch`,
      body
    );
  }

  getFsObjects(
    body: CmsRequestInterface<ViewRequest>
  ): Observable<CmsResponseInterface<ViewResponse>> {
    return this.http.post<CmsResponseInterface<ViewResponse>>(
      `${environment.apiUrl}/dispatch`,
      body
    );
  }

  createFolder<Request, Response>(
    body: CmsRequestInterface<Request>
  ): Observable<CmsResponseInterface<Response>> {
    return this.http.post<CmsResponseInterface<Response>>(
      `${environment.apiUrl}/dispatch`,
      body
    );
  }

  renameFolder(name: string, source: string): Observable<string> {
    return this.http.put<string>(`${environment.apiUrl}/folders/rename`, {
      name,
      source,
    });
  }

  moveFolder(from: string, to: string): Observable<HttpResponse<string>> {
    return this.http.put(
      `${environment.apiUrl}/folders/move`,
      {
        from,
        to,
      },
      { observe: 'response', responseType: 'text' }
    );
  }

  getDownloadTicket(path: string): Observable<{ ticket: string }> {
    return this.http.get<{ ticket: string }>(
      `${environment.apiUrl}/files/ticket?path=${path}`
    );
  }

  download(ticket: string): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${environment.apiUrl}/files/download?ticket=${ticket}`,
      { observe: 'response', responseType: 'blob' }
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
  ): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/dispatch`, body, {
      headers: new HttpHeaders(headers),
      observe: 'response',
    });
  }
}
