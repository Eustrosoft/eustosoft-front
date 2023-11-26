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
  Subject,
  switchMap,
  tap,
  throwError,
  toArray,
} from 'rxjs';
import { FileReaderService, UploadItemForm } from '@eustrosoft-front/core';
import { ExplorerRequestBuilderService } from './explorer-request-builder.service';
import { ExplorerService } from './explorer.service';
import { UploadItemState } from '../constants/enums/uploading-state.enum';
import { ExplorerUploadItemsService } from './explorer-upload-items.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Injectable()
export class ExplorerUploadService {
  private fileReaderService = inject(FileReaderService);
  private explorerRequestBuilderService = inject(ExplorerRequestBuilderService);
  private explorerService = inject(ExplorerService);
  private explorerUploadItemsService = inject(ExplorerUploadItemsService);
  private fb = inject(FormBuilder);

  teardownUpload$ = new Subject<void>();

  uploadHexString(path: string = '/') {
    return this.explorerUploadItemsService.uploadItems$.asObservable().pipe(
      switchMap((items) => combineLatest([of(items), from(items.controls)])),
      filter(
        ([itemsForms, itemForm]) =>
          itemForm.controls.uploadItem.value.state !== UploadItemState.UPLOADED
      ),
      filter(
        ([itemsForms, itemForm]) =>
          !itemForm.controls.uploadItem.value.cancelled
      ),
      concatMap(([itemsForms, itemForm]) =>
        this.fileReaderService
          .splitOneToHexString(itemForm.controls.uploadItem.value)
          .pipe(
            concatMap((item) =>
              from(item.chunks).pipe(
                concatMap((chunk: string, currentChunk: number) => {
                  const request =
                    this.explorerRequestBuilderService.buildHexChunkRequest(
                      item.file,
                      chunk,
                      currentChunk,
                      item.chunks.length,
                      itemForm.controls.securityLevel.value,
                      itemForm.controls.description.value,
                      path
                    );

                  return combineLatest([
                    this.explorerService.uploadHexChunks(request, {}),
                    of(itemsForms),
                    of(item.file),
                    of(item.chunks),
                    of(currentChunk),
                  ]);
                }),
                tap(([response, items, file, chunks, currentChunk]) => {
                  console.log(
                    file.name,
                    100 * ((currentChunk + 1) / chunks.length)
                  );
                  const uploadItems = items.controls
                    .map((item) => {
                      if (
                        item.controls.uploadItem.value.file.name === file.name
                      ) {
                        item.controls.uploadItem.value.progress =
                          100 * ((currentChunk + 1) / chunks.length);
                        if (item.controls.uploadItem.value.progress === 100) {
                          item.controls.uploadItem.value.state =
                            UploadItemState.UPLOADED;
                        } else {
                          item.controls.uploadItem.value.state =
                            UploadItemState.UPLOADING;
                        }
                      }
                      return item;
                    })
                    .filter(
                      (itemForm) =>
                        !itemForm.controls.uploadItem.value.cancelled
                    );
                  const formArray =
                    this.fb.array<FormGroup<UploadItemForm>>(uploadItems);
                  this.explorerUploadItemsService.uploadItems$.next(formArray);
                }),
                toArray()
              )
            )
          )
      ),
      tap(() => {
        console.log('teardownUpload$ call');
        this.teardownUpload$.next();
      }),
      catchError((err) => throwError(() => err))
    );
  }
}
