import { Injectable } from '@angular/core';
import {
  CmsRequestActions,
  CreateRequest,
  DeleteRequest,
  FileSystemObject,
  FileSystemObjectTypes,
  MoveCopyRequest,
  QtisRequestResponseInterface,
  Subsystems,
  SupportedLanguages,
  TisRequest,
  UploadRequest,
  ViewRequest,
} from '@eustrosoft-front/core';
import { mergeMap, Observable, of } from 'rxjs';

@Injectable()
export class ExplorerRequestBuilderService {
  buildChunkRequest(payload: {
    file: File;
    chunks: string[];
  }): Observable<TisRequest> {
    return of(payload).pipe(
      mergeMap((obj: { file: File; chunks: string[] }) => {
        return obj.chunks.map(
          (chunk: string, index: number) =>
            ({
              qtisver: 1,
              requests: [
                {
                  parameters: {
                    data: {
                      file: chunk,
                      name: obj.file.name,
                      ext: obj.file.name.split('.').pop() as string,
                      chunk: index,
                      all_chunks: obj.chunks.length,
                    },
                  },
                  request: 'upload_chunks',
                  subsystem: 'file',
                },
              ],
              qtisend: true,
            } as TisRequest)
        );
      })
    );
  }

  buildBinaryChunkRequest(
    file: File,
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number
  ): QtisRequestResponseInterface<UploadRequest> {
    return {
      r: [
        {
          s: Subsystems.FILE,
          r: CmsRequestActions.UPLOAD,
          l: SupportedLanguages.EN_US,
          parameters: {
            data: {
              file: '',
              name: file.name,
              ext: file.name.split('.').pop() as string,
              chunk: chunkIndex,
              all_chunks: totalChunks,
            },
          },
          request: 'upload_chunks_binary',
          subsystem: 'file',
        },
      ],
      t: 0,
    };
  }

  buildMoveCopyRequest(
    from: FileSystemObject[],
    to: string[],
    action: CmsRequestActions
  ): Observable<QtisRequestResponseInterface<MoveCopyRequest>> {
    return of({
      r: from.map(
        (obj: FileSystemObject, i: number) =>
          ({
            s: Subsystems.CMS,
            r: action,
            l: SupportedLanguages.EN_US,
            from: obj.fullPath,
            to: to[i],
          } as MoveCopyRequest)
      ),
      t: 0,
    });
  }

  buildViewRequest(
    path: string
  ): Observable<QtisRequestResponseInterface<ViewRequest>> {
    return of({
      r: [
        {
          s: Subsystems.CMS,
          r: CmsRequestActions.VIEW,
          l: SupportedLanguages.EN_US,
          path: path,
        },
      ],
      t: 0,
    });
  }

  buildCreateRequest(
    path: string,
    type: FileSystemObjectTypes,
    fileName: string
  ): Observable<QtisRequestResponseInterface<CreateRequest>> {
    return of({
      r: [
        {
          s: Subsystems.CMS,
          r: CmsRequestActions.CREATE,
          l: SupportedLanguages.EN_US,
          path: path,
          type,
          fileName,
        },
      ],
      t: 0,
    });
  }

  buildDeleteRequests(
    rows: FileSystemObject[]
  ): Observable<QtisRequestResponseInterface<DeleteRequest>> {
    return of({
      r: rows.map(
        (row: FileSystemObject) =>
          ({
            s: Subsystems.CMS,
            r: CmsRequestActions.DELETE,
            l: SupportedLanguages.EN_US,
            path: row.fullPath,
          } as DeleteRequest)
      ),
      t: 0,
    });
  }
}
