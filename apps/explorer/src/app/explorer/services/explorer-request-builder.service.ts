import { Injectable } from '@angular/core';
import {
  CmsRequestActions,
  CmsRequestInterface,
  CreateRequest,
  FileSystemObjectTypes,
  Subsystems,
  SupportedLanguages,
  TisRequest,
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
  ): TisRequest {
    return {
      qtisver: 1,
      requests: [
        {
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
      qtisend: true,
    } as TisRequest;
  }

  buildViewRequest(path: string): Observable<CmsRequestInterface<ViewRequest>> {
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
  ): Observable<CmsRequestInterface<CreateRequest>> {
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
}
