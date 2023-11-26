/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import { UploadItemForm } from '@eustrosoft-front/core';
import { UploadItemState } from '../../constants/enums/uploading-state.enum';
import { catchError, EMPTY, Observable, shareReplay, tap } from 'rxjs';
import { Option } from '@eustrosoft-front/common-ui';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ExplorerDictionaryService } from '../../services/explorer-dictionary.service';
import { FormArray, FormGroup } from '@angular/forms';
import { ExplorerUploadItemsService } from '../../services/explorer-upload-items.service';

@Component({
  selector: 'eustrosoft-front-upload-overlay',
  templateUrl: './upload-overlay.component.html',
  styleUrls: ['./upload-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOverlayComponent {
  private snackBar = inject(MatSnackBar);
  private translateService = inject(TranslateService);
  private explorerDictionaryService = inject(ExplorerDictionaryService);
  private explorerUploadItemsService = inject(ExplorerUploadItemsService);

  @Output() startUpload = new EventEmitter<void>();
  @Output() removeItem = new EventEmitter<{
    item: FormGroup<UploadItemForm>;
    index: number;
  }>();
  @Output() closeOverlay = new EventEmitter<void>();
  @Output() openFileFolder = new EventEmitter<string>();

  readonly UploadingState = UploadItemState;
  startUploadButtonText = 'EXPLORER.UPLOAD_OVERLAY.START_UPLOAD_BUTTON_TEXT';
  startUploadButtonDisabled = false;

  uploadItems$: Observable<FormArray<FormGroup<UploadItemForm>>> =
    this.explorerUploadItemsService.uploadItems$.asObservable().pipe(
      tap((forms) => {
        const isUploading = forms.controls.some(
          (form) =>
            form.controls.uploadItem.value.state === UploadItemState.UPLOADING
        );
        console.log('isUploading: ', isUploading);
        if (isUploading) {
          this.modifyUploadingView(isUploading);
        } else {
          this.modifyUploadingView(
            false,
            'EXPLORER.UPLOAD_OVERLAY.START_UPLOAD_BUTTON_TEXT'
          );
        }
      })
    );

  securityLevelOptions$: Observable<Option[]> = this.explorerDictionaryService
    .getSecurityLevelOptions()
    .pipe(
      shareReplay(1),
      catchError((err: HttpErrorResponse) => {
        this.snackBar.open(
          this.translateService.instant(
            'EXPLORER.ERRORS.SECURITY_LEVEL_OPTIONS_FETCH_ERROR'
          ),
          'close'
        );
        return EMPTY;
      })
    );

  openFolder(item: FormGroup<UploadItemForm>): void {
    this.openFileFolder.emit(item.controls.uploadItem.value.uploadPath);
  }

  remove(item: FormGroup<UploadItemForm>, index: number): void {
    item.controls.uploadItem.setValue({
      ...item.controls.uploadItem.value,
      cancelled: true,
    });
    this.removeItem.emit({ item, index });
  }

  close(): void {
    this.closeOverlay.emit();
  }

  runUpload(): void {
    this.startUpload.emit();
    this.modifyUploadingView(true);
  }

  modifyUploadingView(
    isUploading: boolean,
    startUploadButtonText = 'EXPLORER.UPLOAD_OVERLAY.START_UPLOAD_BUTTON_TEXT_UPLOADING_STATE'
  ): void {
    this.startUploadButtonDisabled = isUploading;
    this.startUploadButtonText = startUploadButtonText;
  }
}
