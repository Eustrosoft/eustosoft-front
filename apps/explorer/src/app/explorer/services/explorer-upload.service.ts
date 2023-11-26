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
import { UploadItemState } from '../constants/enums/uploading-state.enum';
import { ExplorerUploadItemsService } from './explorer-upload-items.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Injectable()
export class ExplorerUploadService {
  private fileReaderService = inject(FileReaderService);
  private explorerRequestBuilderService = inject(ExplorerRequestBuilderService);
  private explorerService = inject(ExplorerService);
  private explorerUploadItemsService = inject(ExplorerUploadItemsService);
  private fb = inject(FormBuilder);

  uploadHexString(
    items: FormArray<FormGroup<UploadItemForm>>,
    path: string = '/'
  ) {
    return from(items.controls).pipe(
      filter(
        (item) =>
          item.controls.uploadItem.value.state !== UploadItemState.UPLOADED
      ),
      concatMap((item) =>
        combineLatest([
          of(item),
          this.fileReaderService.splitOneToHexString(
            item.controls.uploadItem.value
          ),
        ])
      ),
      concatMap(([uploadItemForm, item]) =>
        from(item.chunks).pipe(
          concatMap((chunk: string, currentChunk: number) => {
            const request =
              this.explorerRequestBuilderService.buildHexChunkRequest(
                item.file,
                chunk,
                currentChunk,
                item.chunks.length,
                uploadItemForm.controls.securityLevel.value,
                uploadItemForm.controls.description.value,
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
                    UploadItemState.UPLOADED;
                } else {
                  item.controls.uploadItem.value.state =
                    UploadItemState.UPLOADING;
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
