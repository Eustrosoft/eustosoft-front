import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import {
  ChunkedFileRequest,
  FileSystemObject,
  FileSystemObjectTypes,
  TisRequest,
  TisResponse,
  TisResponseBody,
} from '@eustrosoft-front/core';
import { delay, mergeMap, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ExplorerService {
  private fs: FileSystemObject[] = [
    {
      fileName: 'home',
      fullPath: '/home',
      links: [],
      space: 1,
      modified: '2023-02-18T07:13:03.500+00:00',
      created: '1970-01-01T00:00:00.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: 'usr',
      fullPath: '/usr',
      links: [],
      space: 352,
      modified: '2023-02-09T09:39:53.000+00:00',
      created: '2023-02-09T09:39:53.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: 'bin',
      fullPath: '/bin',
      links: [],
      space: 1248,
      modified: '2023-02-09T09:39:53.000+00:00',
      created: '2023-02-09T09:39:53.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: 'sbin',
      fullPath: '/sbin',
      links: [],
      space: 2048,
      modified: '2023-02-09T09:39:53.000+00:00',
      created: '2023-02-09T09:39:53.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      extension: 'file',
      fileName: '.file',
      fullPath: '/.file',
      links: [],
      created: '2023-02-09T09:39:53.000+00:00',
      modified: '2023-02-09T09:39:53.000+00:00',
      space: 0,
      hash: '1392059978',
      type: FileSystemObjectTypes.FILE,
    },
    {
      fileName: 'etc',
      fullPath: '/etc',
      links: [],
      space: 2592,
      modified: '2023-02-18T07:12:54.622+00:00',
      created: '2023-02-09T09:39:53.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: 'var',
      fullPath: '/var',
      links: [],
      space: 1152,
      modified: '2023-02-18T07:12:57.557+00:00',
      created: '2023-02-09T09:39:53.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: 'Library',
      fullPath: '/Library',
      links: [],
      space: 2144,
      modified: '2023-02-18T07:12:49.751+00:00',
      created: '2023-02-09T09:39:53.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: 'System',
      fullPath: '/System',
      links: [],
      space: 320,
      modified: '2023-02-09T09:39:53.000+00:00',
      created: '2023-02-09T09:39:53.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: 'private',
      fullPath: '/private',
      links: [],
      space: 192,
      modified: '2023-02-18T07:12:57.557+00:00',
      created: '2023-02-09T09:39:53.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: '.vol',
      fullPath: '/.vol',
      links: [],
      space: 64,
      modified: '2023-02-09T09:39:53.000+00:00',
      created: '2023-02-09T09:39:53.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: 'Users',
      fullPath: '/Users',
      links: [],
      space: 160,
      modified: '2023-02-18T07:12:17.126+00:00',
      created: '2022-02-26T08:05:25.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: 'Applications',
      fullPath: '/Applications',
      links: [],
      space: 1376,
      modified: '2023-02-18T07:12:49.762+00:00',
      created: '2023-02-09T09:39:53.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: 'opt',
      fullPath: '/opt',
      links: [],
      space: 96,
      modified: '2022-11-12T12:45:56.238+00:00',
      created: '2022-02-26T07:05:07.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: 'dev',
      fullPath: '/dev',
      links: [],
      space: 4738,
      modified: '2023-02-18T07:11:40.000+00:00',
      created: '1970-01-01T00:00:00.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: 'Volumes',
      fullPath: '/Volumes',
      links: [],
      space: 96,
      modified: '2023-02-18T07:12:59.510+00:00',
      created: '2022-02-26T07:05:07.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: 'tmp',
      fullPath: '/tmp',
      links: [],
      space: 448,
      modified: '2023-02-19T19:14:23.310+00:00',
      created: '2023-02-18T07:12:57.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
    {
      fileName: 'cores',
      fullPath: '/cores',
      links: [],
      space: 64,
      modified: '2022-02-26T07:05:07.000+00:00',
      created: '2022-02-26T07:05:07.000+00:00',
      type: FileSystemObjectTypes.DIRECTORY,
    },
  ];

  constructor(private http: HttpClient) {}

  getFsObjects(path: string): Observable<FileSystemObject[]> {
    // return of(this.fs);
    return this.http.get<FileSystemObject[]>(
      `${environment.apiUrl}/folders?path=/${path}`
    );
  }

  createFsObject(obj: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/folders`, obj);
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
      .post<TisResponse>(`${environment.apiUrl}/api/dispatch`, query)
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
    return of(true).pipe(delay(50000));
    return this.http.post<any>(`${environment.apiUrl}/api/dispatch`, body, {
      headers: new HttpHeaders(headers),
      observe: 'response',
    });
  }
}
