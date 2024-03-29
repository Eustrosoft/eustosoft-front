/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import {
  combineLatest,
  concatMap,
  filter,
  from,
  Observable,
  of,
  switchMap,
  tap,
  toArray,
} from 'rxjs';
import { ExplorerRequestBuilderService } from './explorer-request-builder.service';
import { UploadItemState } from '../constants/enums/uploading-state.enum';
import { ExplorerUploadItemsService } from './explorer-upload-items.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FileReaderService } from './file-reader.service';
import { UploadHexRequest } from '../interfaces/explorer-request.interface';
import { UploadItemForm } from '../interfaces/upload-item-form.interface';
import { UploadResponse } from '../interfaces/explorer-response.interface';
import { DispatchService, QtisRequestResponse } from '@eustrosoft-front/core';

@Injectable({ providedIn: 'root' })
export class ExplorerUploadService {
  private readonly fileReaderService = inject(FileReaderService);
  private readonly explorerRequestBuilderService = inject(
    ExplorerRequestBuilderService,
  );
  private readonly dispatchService = inject(DispatchService);
  private readonly explorerUploadItemsService = inject(
    ExplorerUploadItemsService,
  );
  private readonly fb = inject(FormBuilder);

  uploadHexString(
    path: string = '/',
  ): Observable<
    [
      FormArray<FormGroup<UploadItemForm>>,
      File,
      string[],
      number,
      QtisRequestResponse<UploadResponse>,
    ][]
  > {
    return this.explorerUploadItemsService.uploadItems$.asObservable().pipe(
      switchMap((items) => combineLatest([from(items.controls), of(items)])),
      filter(
        ([itemForm]) =>
          itemForm.controls.uploadItem.value.state !== UploadItemState.UPLOADED,
      ),
      filter(([itemForm]) => !itemForm.controls.uploadItem.value.cancelled),
      concatMap(([itemForm, itemsForms]) =>
        this.fileReaderService
          .splitOneToHexString(itemForm.controls.uploadItem.value)
          .pipe(
            concatMap((item) =>
              from(item.chunks).pipe(
                concatMap((chunk: string, currentChunk: number) => {
                  const request =
                    this.explorerRequestBuilderService.buildHexChunkRequest(
                      item.file,
                      itemForm.controls.filename.value,
                      chunk,
                      currentChunk,
                      item.chunks.length,
                      itemForm.controls.securityLevel.value,
                      itemForm.controls.description.value,
                      path,
                    );

                  return combineLatest([
                    of(itemsForms),
                    of(item.file),
                    of(item.chunks),
                    of(currentChunk),
                    this.dispatchService.dispatch<
                      UploadHexRequest,
                      UploadResponse
                    >(request),
                  ]);
                }),
                tap(([items, file, chunks, currentChunk]) => {
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
                        !itemForm.controls.uploadItem.value.cancelled,
                    );
                  const formArray =
                    this.fb.array<FormGroup<UploadItemForm>>(uploadItems);
                  this.explorerUploadItemsService.uploadItems$.next(formArray);
                }),
                toArray(),
              ),
            ),
          ),
      ),
    );
  }
}
