/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
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
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UploadItemState } from '../../constants/enums/uploading-state.enum';
import { map, Observable, shareReplay, tap } from 'rxjs';
import { SecurityLevels, UploadItemForm } from '@eustrosoft-front/core';
import { ExplorerUploadItemsService } from '../../services/explorer-upload-items.service';
import { ExplorerDictionaryService } from '../../services/explorer-dictionary.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProgressBarComponent } from '@eustrosoft-front/common-ui';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'eustrosoft-front-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatDialogTitle,
    MatDialogContent,
    MatButtonModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    NgFor,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatTooltipModule,
    ProgressBarComponent,
    MatDialogActions,
    AsyncPipe,
    TranslateModule,
  ],
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

  private readonly explorerUploadItemsService = inject(
    ExplorerUploadItemsService,
  );
  private readonly explorerDictionaryService = inject(
    ExplorerDictionaryService,
  );
  private readonly snackBar = inject(MatSnackBar);
  private readonly translateService = inject(TranslateService);
  protected readonly UploadingState = UploadItemState;
  protected readonly securityLevelOptions$ =
    this.explorerDictionaryService.securityOptions$;

  protected startUploadButtonText =
    'EXPLORER.UPLOAD_DIALOG.START_UPLOAD_BUTTON_TEXT';
  protected startUploadButtonDisabled = false;
  protected showSuggestion = false;
  protected warningText = '';
  protected descriptionSuggestionShown = false;
  protected securityLevelSuggestionShown = false;

  protected uploadItems$: Observable<FormArray<FormGroup<UploadItemForm>>> =
    this.explorerUploadItemsService.uploadItems$
      .asObservable()
      .pipe(shareReplay(1));

  protected isUploading$ = this.uploadItems$.pipe(
    map((forms) =>
      forms.controls.some(
        (form) =>
          form.controls.uploadItem.value.state === UploadItemState.UPLOADING,
      ),
    ),
    tap((isUploading) => {
      if (isUploading) {
        this.modifyUploadButtonState(isUploading);
      } else {
        this.warningText = '';
        this.modifyUploadButtonState(
          false,
          'EXPLORER.UPLOAD_DIALOG.START_UPLOAD_BUTTON_TEXT',
        );
      }
    }),
  );

  protected uploadCompleted$ = this.uploadItems$.pipe(
    map(
      (forms) =>
        forms.controls.length > 0 &&
        forms.controls.every(
          (form) =>
            form.controls.uploadItem.value.state === UploadItemState.UPLOADED,
        ),
    ),
    tap((uploadCompleted) => {
      if (uploadCompleted) {
        this.snackBar.open(
          this.translateService.instant(
            'EXPLORER.UPLOAD_DIALOG.UPLOAD_COMPLETE_TEXT',
          ),
          'close',
          {
            duration: 10000,
          },
        );
        this.modifyUploadButtonState(
          false,
          'EXPLORER.UPLOAD_DIALOG.START_UPLOAD_BUTTON_TEXT',
        );
      }
    }),
  );

  cancel(): void {
    this.cancelUploadClicked.emit();
  }

  startUpload(forms: FormArray<FormGroup<UploadItemForm>> | null): void {
    if (!forms || forms.controls.length === 0) {
      this.warningText = 'EXPLORER.UPLOAD_DIALOG.SUGGESTIONS.SELECT_FILES';
      return;
    }

    if (
      forms.controls[0].controls.description.value === '' &&
      !this.descriptionSuggestionShown
    ) {
      this.warningText =
        'EXPLORER.UPLOAD_DIALOG.SUGGESTIONS.FILL_DESCRIPTION_TEXT';
      this.modifyUploadButtonState(
        false,
        'EXPLORER.UPLOAD_DIALOG.PROCEED_AFTER_SUGGESTION_TEXT',
      );
      this.descriptionSuggestionShown = true;
      return;
    }

    const isLowSecurityLevel =
      forms.controls[0].controls.securityLevel.value !== undefined &&
      [
        SecurityLevels.SYSTEM,
        SecurityLevels.PUBLIC,
        SecurityLevels.PUBLIC_PLUS,
      ].includes(forms.controls[0].controls.securityLevel.value);

    if (isLowSecurityLevel && !this.securityLevelSuggestionShown) {
      this.warningText =
        'EXPLORER.UPLOAD_DIALOG.SUGGESTIONS.SECURITY_LVL_WARNING';
      this.modifyUploadButtonState(
        false,
        'EXPLORER.UPLOAD_DIALOG.PROCEED_AFTER_SUGGESTION_TEXT',
      );
      this.securityLevelSuggestionShown = true;
      return;
    }

    this.warningText = '';
    this.modifyUploadButtonState(true);
    this.descriptionSuggestionShown = false;
    this.securityLevelSuggestionShown = false;
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
    startUploadButtonText = 'EXPLORER.UPLOAD_DIALOG.START_UPLOAD_BUTTON_TEXT_UPLOADING_STATE',
  ): void {
    this.startUploadButtonDisabled = uploadButtonDisabled;
    this.startUploadButtonText = startUploadButtonText;
  }
}
