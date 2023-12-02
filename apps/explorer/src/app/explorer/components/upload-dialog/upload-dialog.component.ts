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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormGroup } from '@angular/forms';
import { UploadDialogDataInterface } from './upload-dialog-data.interface';
import { UploadItemState } from '../../constants/enums/uploading-state.enum';
import { map, Observable, shareReplay, tap } from 'rxjs';
import { UploadItemForm } from '@eustrosoft-front/core';
import { ExplorerUploadItemsService } from '../../services/explorer-upload-items.service';
import { ExplorerDictionaryService } from '../../services/explorer-dictionary.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'eustrosoft-front-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialogComponent {
  @Output() fileSelectClicked = new EventEmitter<void>();
  @Output() startUploadClicked = new EventEmitter<void>();
  @Output() cancelUploadClicked = new EventEmitter<void>();
  @Output() removeItem = new EventEmitter<{
    item: FormGroup<UploadItemForm>;
    index: number;
  }>();
  @Output() openFileFolder = new EventEmitter<string>();

  private dialogRef = inject<MatDialogRef<UploadDialogComponent>>(
    MatDialogRef<UploadDialogComponent>
  );
  private explorerUploadItemsService = inject(ExplorerUploadItemsService);
  private explorerDictionaryService = inject(ExplorerDictionaryService);
  private snackBar = inject(MatSnackBar);
  private translateService = inject(TranslateService);
  public data: UploadDialogDataInterface = inject(MAT_DIALOG_DATA);
  readonly UploadingState = UploadItemState;

  startUploadButtonText = this.data.startUploadButtonText;
  startUploadButtonDisabled = false;
  startUploadClicksCount = 0;

  showSuggestion = false;
  suggestionText = '';

  uploadItems$: Observable<FormArray<FormGroup<UploadItemForm>>> =
    this.explorerUploadItemsService.uploadItems$
      .asObservable()
      .pipe(shareReplay(1));

  isUploading$ = this.uploadItems$.pipe(
    map((forms) =>
      forms.controls.some(
        (form) =>
          form.controls.uploadItem.value.state === UploadItemState.UPLOADING
      )
    ),
    tap((isUploading) => {
      console.log('isUploading: ', isUploading);
      if (isUploading) {
        this.modifyUploadButtonState(isUploading);
      } else {
        this.suggestionText = '';
        this.modifyUploadButtonState(
          false,
          'EXPLORER.UPLOAD_DIALOG.START_UPLOAD_BUTTON_TEXT'
        );
      }
    })
  );

  uploadCompleted$ = this.uploadItems$.pipe(
    map(
      (forms) =>
        forms.controls.length > 0 &&
        forms.controls.every(
          (form) =>
            form.controls.uploadItem.value.state === UploadItemState.UPLOADED
        )
    ),
    tap((uploadCompleted) => {
      console.log('uploadCompleted: ', uploadCompleted);
      if (uploadCompleted) {
        this.snackBar.open(
          this.translateService.instant(this.data.uploadCompleteText),
          'close',
          {
            duration: 2500,
          }
        );
        this.startUploadClicksCount = 0;
        this.modifyUploadButtonState(false, this.data.startUploadButtonText);
      }
    })
  );

  securityLevelOptions$ = this.explorerDictionaryService.securityOptions$;

  cancelUpload(): void {
    this.cancelUploadClicked.emit();
  }

  startUpload(forms: FormArray<FormGroup<UploadItemForm>> | null): void {
    if (
      !forms ||
      (forms && forms.controls.length === 0) ||
      forms.controls.every(
        (form) =>
          form.controls.uploadItem.value.state === UploadItemState.UPLOADED
      )
    ) {
      this.suggestionText =
        'EXPLORER.UPLOAD_DIALOG.SUGGESTIONS.SELECT_NEW_FILES';
      return;
    }
    this.startUploadClicksCount++;
    if (
      forms &&
      forms.controls[0].controls.description.value === '' &&
      this.startUploadClicksCount < 2
    ) {
      this.suggestionText =
        'EXPLORER.UPLOAD_DIALOG.SUGGESTIONS.FILL_DESCRIPTION_TEXT';
      this.modifyUploadButtonState(
        false,
        'EXPLORER.UPLOAD_DIALOG.PROCEED_AFTER_SUGGESTION_TEXT'
      );
      return;
    }
    this.suggestionText = '';
    this.modifyUploadButtonState(true);
    this.startUploadClicked.emit();
  }

  selectFile(): void {
    this.showSuggestion = false;
    this.fileSelectClicked.emit();
  }

  openFolder(item: FormGroup<UploadItemForm>): void {
    this.openFileFolder.emit(item.controls.uploadItem.value.uploadPath);
    this.cancelUploadClicked.emit();
  }

  remove(item: FormGroup<UploadItemForm>, index: number): void {
    item.controls.uploadItem.setValue({
      ...item.controls.uploadItem.value,
      cancelled: true,
    });
    this.removeItem.emit({ item, index });
  }

  modifyUploadButtonState(
    uploadButtonDisabled: boolean,
    startUploadButtonText = 'EXPLORER.UPLOAD_DIALOG.START_UPLOAD_BUTTON_TEXT_UPLOADING_STATE'
  ): void {
    this.startUploadButtonDisabled = uploadButtonDisabled;
    this.startUploadButtonText = startUploadButtonText;
  }
}
