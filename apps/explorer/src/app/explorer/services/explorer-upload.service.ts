import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  filter,
  from,
  of,
  tap,
  throwError,
  toArray,
} from 'rxjs';
import { FileReaderService, UploadItem } from '@eustrosoft-front/core';
import { ExplorerRequestBuilderService } from './explorer-request-builder.service';
import { ExplorerService } from './explorer.service';
import { UploadingState } from '../constants/enums/uploading-state.enum';

@Injectable()
export class ExplorerUploadService {
  uploadItems$ = new BehaviorSubject<UploadItem[]>([]);

  constructor(
    private fileReaderService: FileReaderService,
    private explorerRequestBuilderService: ExplorerRequestBuilderService,
    private explorerService: ExplorerService
  ) {}
  uploadBinary(items: UploadItem[], path: string = '/') {
    return from(items).pipe(
      filter((item) => item.state !== UploadingState.UPLOADED),
      concatMap((item) => this.fileReaderService.splitOneBinary(item)),
      concatMap((item) =>
        from(item.chunks).pipe(
          concatMap((chunk: Blob, currentChunk: number) => {
            const request =
              this.explorerRequestBuilderService.buildBinaryChunkRequest(
                item.file,
                chunk,
                currentChunk,
                item.chunks.length,
                path
              );
            const formData = new FormData();
            formData.set('file', chunk);
            formData.set('json', JSON.stringify(request));

            return combineLatest([
              this.explorerService.uploadChunks(formData, {
                'Content-Disposition': `form-data; name="file"; filename="${item.file.name}"`,
              }),
              of(items),
              of(item.file),
              of(item.chunks),
              of(currentChunk),
            ]);
          }),
          tap(([response, items, file, chunks, currentChunk]) => {
            const uploadItems = items.map((item) => {
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
            this.uploadItems$.next(uploadItems);
          }),
          toArray()
        )
      ),
      catchError((err) => throwError(() => err))
    );
  }

  uploadBase64(items: UploadItem[], path: string = '/') {
    return from(items).pipe(
      filter((item) => item.state !== UploadingState.UPLOADED),
      concatMap((item) => this.fileReaderService.splitOneBase64(item)),
      concatMap((item) =>
        from(item.chunks).pipe(
          concatMap((chunk: string, currentChunk: number) => {
            const request =
              this.explorerRequestBuilderService.buildBase64ChunkRequest(
                item.file,
                chunk,
                currentChunk,
                item.chunks.length,
                path
              );
            const formData = new FormData();
            formData.set('json', JSON.stringify(request));

            return combineLatest([
              this.explorerService.uploadChunks(formData, {
                // 'Content-Disposition': `form-data; name="file"; filename="${item.file.name}"`,
              }),
              of(items),
              of(item.file),
              of(item.chunks),
              of(currentChunk),
            ]);
          }),
          tap(([response, items, file, chunks, currentChunk]) => {
            const uploadItems = items.map((item) => {
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
            this.uploadItems$.next(uploadItems);
          }),
          toArray()
        )
      ),
      catchError((err) => throwError(() => err))
    );
  }

  uploadHexString(items: UploadItem[], path: string = '/') {
    return from(items).pipe(
      filter((item) => item.state !== UploadingState.UPLOADED),
      concatMap((item) => this.fileReaderService.splitOneToHexString(item)),
      concatMap((item) =>
        from(item.chunks).pipe(
          concatMap((chunk: string, currentChunk: number) => {
            const request =
              this.explorerRequestBuilderService.buildHexChunkRequest(
                item.file,
                chunk,
                currentChunk,
                item.chunks.length,
                path
              );
            const formData = new FormData();
            // formData.set('file', chunk);
            formData.set('json', JSON.stringify(request));

            return combineLatest([
              this.explorerService.uploadChunks(formData, {
                // 'Content-Disposition': `form-data; name="file"; filename="${item.file.name}"`,
              }),
              of(items),
              of(item.file),
              of(item.chunks),
              of(currentChunk),
            ]);
          }),
          tap(([response, items, file, chunks, currentChunk]) => {
            const uploadItems = items.map((item) => {
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
            this.uploadItems$.next(uploadItems);
          }),
          toArray()
        )
      ),
      catchError((err) => throwError(() => err))
    );
  }
}
