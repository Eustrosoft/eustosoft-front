import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChunkedFileRequest,
  TisRequest,
  TisResponse,
  TisResponseBody,
} from '@eustrosoft-front/core';
import { mergeMap, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FileSystemObject } from '@eustrosoft-front/core';
import { FileSystemObjectTypes } from '@eustrosoft-front/core';

@Injectable()
export class ExplorerService {
  private fs: FileSystemObject[] = [
    {
      id: '1',
      title: 'first-folder',
      type: FileSystemObjectTypes.FOLDER,
      children: [
        {
          id: '11',
          title: 'first-child-of-first',
          type: FileSystemObjectTypes.FOLDER,
          children: [
            {
              id: '1',
              title: '111',
              type: FileSystemObjectTypes.FILE,
              children: [],
              info: {
                created: '',
                modified: '1',
                owner: '',
              },
            },
            {
              id: '2',
              title: '222',
              type: FileSystemObjectTypes.FILE,
              children: [],
              info: {
                created: '',
                modified: '1',
                owner: '',
              },
            },
            {
              id: '3',
              title: '333',
              type: FileSystemObjectTypes.FILE,
              children: [],
              info: {
                created: '',
                modified: '1',
                owner: '',
              },
            },
          ],
          info: {
            created: '',
            modified: '1',
            owner: '',
          },
        },
        {
          id: '22',
          title: 'second-child-child-of-first',
          type: FileSystemObjectTypes.FOLDER,
          children: [],
          info: {
            created: '',
            modified: '1',
            owner: '',
          },
        },
      ],
      info: {
        created: '',
        modified: '1',
        owner: '',
      },
    },
    {
      id: '2',
      title: 'second-folder',
      type: FileSystemObjectTypes.FOLDER,
      children: [
        {
          id: '11',
          title: 'first-child-child-of-second',
          type: FileSystemObjectTypes.FOLDER,
          children: [],
          info: {
            created: '',
            modified: '1',
            owner: '',
          },
        },
      ],
      info: {
        created: '',
        modified: '1',
        owner: '',
      },
    },
    {
      id: '3',
      title: 'first-file.txt',
      type: FileSystemObjectTypes.FILE,
      children: [],
      info: {
        created: '',
        modified: '1',
        owner: '',
      },
    },
  ];

  constructor(private http: HttpClient) {}

  getFsObjects(path: string): Observable<FileSystemObject[]> {
    if (path === '') {
      return of(this.fs);
    } else {
      return of(this.findElement(path, this.fs));
    }
    // return this.http.get<FileSystemObject[]>(
    //   `${environment.apiUrl}/api/folders`
    // );
  }

  findElement(path: string, ctx: FileSystemObject[]): FileSystemObject[] {
    const pt = path.includes('/') ? path.split('/') : path;
    if (Array.isArray(pt)) {
      return this.findElement(
        pt[1],
        ctx.find((item) => item.title === pt[0])?.children as FileSystemObject[]
      );
    }
    return ctx.find((item) => item.title === pt)
      ?.children as FileSystemObject[];
  }

  createFsObject(obj: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/folders`, obj);
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
    return this.http.post<any>(`${environment.apiUrl}/api/dispatch`, body, {
      headers: new HttpHeaders(headers),
      observe: 'response',
    });
  }
}
