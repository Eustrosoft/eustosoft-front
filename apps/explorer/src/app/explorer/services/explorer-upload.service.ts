import { Injectable } from '@angular/core';
import {
  catchError,
  combineLatest,
  concatMap,
  from,
  map,
  of,
  throwError,
} from 'rxjs';
import { FileReaderService } from '@eustrosoft-front/core';
import { ExplorerRequestBuilderService } from './explorer-request-builder.service';
import { ExplorerService } from './explorer.service';
import { UploadItem } from '../interfaces/upload-item.interface';
import { UploadingState } from '../constants/enums/uploading-state.enum';

@Injectable()
export class ExplorerUploadService {
  constructor(
    private fileReaderService: FileReaderService,
    private explorerRequestBuilderService: ExplorerRequestBuilderService,
    private explorerService: ExplorerService
  ) {}
  upload(files: File[], path: string = '/') {
    return of(files).pipe(
      concatMap((files: File[]) =>
        combineLatest([
          of(
            files.map(
              (file) =>
                ({
                  file,
                  progress: 0,
                  state: UploadingState.PENDING,
                } as UploadItem)
            )
          ),
          this.fileReaderService.splitBinary(files),
        ])
      ),
      concatMap(([items, { file, chunks }]) => {
        return from(chunks).pipe(
          concatMap((chunk: Blob, currentChunk: number) => {
            const request =
              this.explorerRequestBuilderService.buildBinaryChunkRequest(
                file,
                chunk,
                currentChunk,
                chunks.length,
                path
              );
            const formData = new FormData();
            formData.set('file', chunk);
            formData.set('json', JSON.stringify(request));

            return combineLatest([
              this.explorerService.uploadChunks(formData, {
                'Content-Disposition': `form-data; name="file"; filename="${file.name}"`,
              }),
              of(items),
              of(file),
              of(chunks),
              of(currentChunk),
            ]);
          }),
          map(([response, items, file, chunks, currentChunk]) => {
            return items.map((item) => {
              if (item.file.name === file.name) {
                item.progress = 100 * ((currentChunk + 1) / chunks.length);
                if (item.progress === 100) {
                  item.state = UploadingState.UPLOADED;
                } else {
                  item.state = UploadingState.UPLOADING;
                }
              }
              return item;
            });
          })
        );
      }),
      catchError((err) => throwError(() => err))
    );
  }
}
