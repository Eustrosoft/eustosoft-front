/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import {
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
import { FileReaderService, UploadItemForm } from '@eustrosoft-front/core';
import { ExplorerRequestBuilderService } from './explorer-request-builder.service';
import { ExplorerService } from './explorer.service';
import { UploadingState } from '../constants/enums/uploading-state.enum';
import { ExplorerUploadItemsService } from './explorer-upload-items.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Injectable()
export class ExplorerUploadService {
  private fileReaderService = inject(FileReaderService);
  private explorerRequestBuilderService = inject(ExplorerRequestBuilderService);
  private explorerService = inject(ExplorerService);
  private explorerUploadItemsService = inject(ExplorerUploadItemsService);
  private fb = inject(FormBuilder);

  // uploadBinary(items: UploadItem[], path: string = '/') {
  //   return from(items).pipe(
  //     filter((item) => item.state !== UploadingState.UPLOADED),
  //     concatMap((item) => this.fileReaderService.splitOneBinary(item)),
  //     concatMap((item) =>
  //       from(item.chunks).pipe(
  //         concatMap((chunk: Blob, currentChunk: number) =>
  //           combineLatest([
  //             of(chunk),
  //             of(currentChunk),
  //             this.fileReaderService.blobToUint8Array(chunk),
  //           ])
  //         ),
  //         concatMap(([chunk, currentChunk, uint8Array]) => {
  //           const request =
  //             this.explorerRequestBuilderService.buildBinaryChunkRequest(
  //               item.file,
  //               chunk,
  //               currentChunk,
  //               item.chunks.length,
  //               uint8Array,
  //               path
  //             );
  //           const formData = new FormData();
  //           formData.set('file', chunk);
  //           formData.set('json', JSON.stringify(request));
  //
  //           return combineLatest([
  //             this.explorerService.uploadChunks(formData, {}),
  //             of(items),
  //             of(item.file),
  //             of(item.chunks),
  //             of(currentChunk),
  //           ]);
  //         }),
  //         tap(([response, items, file, chunks, currentChunk]) => {
  //           const uploadItems = items.map((item) => {
  //             if (item.file.name === file.name) {
  //               item.progress = 100 * ((currentChunk + 1) / chunks.length);
  //               if (item.progress === 100) {
  //                 item.state = UploadingState.UPLOADED;
  //               } else {
  //                 item.state = UploadingState.UPLOADING;
  //               }
  //             }
  //             return item;
  //           });
  //           this.explorerUploadItemsService.uploadItems$.next(uploadItems);
  //         }),
  //         toArray()
  //       )
  //     ),
  //     catchError((err) => throwError(() => err))
  //   );
  // }
  //
  // uploadBase64(items: UploadItem[], path: string = '/') {
  //   return from(items).pipe(
  //     filter((item) => item.state !== UploadingState.UPLOADED),
  //     concatMap((item) => this.fileReaderService.splitOneBase64(item)),
  //     concatMap((item) =>
  //       from(item.chunks).pipe(
  //         concatMap((chunk: string, currentChunk: number) => {
  //           const request =
  //             this.explorerRequestBuilderService.buildBase64ChunkRequest(
  //               item.file,
  //               chunk,
  //               currentChunk,
  //               item.chunks.length,
  //               path
  //             );
  //           const formData = new FormData();
  //           formData.set('json', JSON.stringify(request));
  //
  //           return combineLatest([
  //             this.explorerService.uploadChunks(formData, {}),
  //             of(items),
  //             of(item.file),
  //             of(item.chunks),
  //             of(currentChunk),
  //           ]);
  //         }),
  //         tap(([response, items, file, chunks, currentChunk]) => {
  //           const uploadItems = items.map((item) => {
  //             if (item.file.name === file.name) {
  //               item.progress = 100 * ((currentChunk + 1) / chunks.length);
  //               if (item.progress === 100) {
  //                 item.state = UploadingState.UPLOADED;
  //               } else {
  //                 item.state = UploadingState.UPLOADING;
  //               }
  //             }
  //             return item;
  //           });
  //           this.explorerUploadItemsService.uploadItems$.next(uploadItems);
  //         }),
  //         toArray()
  //       )
  //     ),
  //     catchError((err) => throwError(() => err))
  //   );
  // }

  uploadHexString(
    items: FormArray<FormGroup<UploadItemForm>>,
    path: string = '/'
  ) {
    return from(items.controls).pipe(
      filter(
        (item) =>
          item.controls.uploadItem.value.state !== UploadingState.UPLOADED
      ),
      concatMap((item) =>
        this.fileReaderService.splitOneToHexString(
          item.controls.uploadItem.value
        )
      ),
      concatMap((item) =>
        from(item.chunks).pipe(
          concatMap((chunk: string, currentChunk: number) => {
            const request =
              this.explorerRequestBuilderService.buildHexChunkRequest(
                item.file,
                chunk,
                currentChunk,
                item.chunks.length,
                item.securityLevel,
                item.description,
                path
              );

            return combineLatest([
              this.explorerService.uploadHexChunks(request, {}),
              of(items),
              of(item.file),
              of(item.chunks),
              of(currentChunk),
            ]);
          }),
          tap(([response, items, file, chunks, currentChunk]) => {
            console.log(file.name, 100 * ((currentChunk + 1) / chunks.length));
            const uploadItems = items.controls.map((item) => {
              if (item.controls.uploadItem.value.file.name === file.name) {
                item.controls.uploadItem.value.progress =
                  100 * ((currentChunk + 1) / chunks.length);
                if (item.controls.uploadItem.value.progress === 100) {
                  item.controls.uploadItem.value.state =
                    UploadingState.UPLOADED;
                } else {
                  item.controls.uploadItem.value.state =
                    UploadingState.UPLOADING;
                }
              }
              return item;
            });
            const formArray =
              this.fb.array<FormGroup<UploadItemForm>>(uploadItems);
            this.explorerUploadItemsService.uploadItems$.next(formArray);
          }),
          toArray()
        )
      ),
      catchError((err) => throwError(() => err))
    );
  }
}
