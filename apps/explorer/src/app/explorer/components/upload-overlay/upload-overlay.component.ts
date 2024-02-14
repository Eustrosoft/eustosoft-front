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
import { UploadItemState } from '../../constants/enums/uploading-state.enum';
import { catchError, EMPTY, Observable, shareReplay, tap } from 'rxjs';
import { Option, ProgressBarComponent } from '@eustrosoft-front/common-ui';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExplorerUploadItemsService } from '../../services/explorer-upload-items.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UploadItemForm } from '@eustrosoft-front/explorer-lib';
import { CachedDictionaryService } from '@eustrosoft-front/dic';

@Component({
  selector: 'eustrosoft-front-upload-overlay',
  templateUrl: './upload-overlay.component.html',
  styleUrls: ['./upload-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    NgIf,
    NgFor,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatInputModule,
    MatTooltipModule,
    ProgressBarComponent,
    AsyncPipe,
    TranslateModule,
  ],
})
export class UploadOverlayComponent {
  private snackBar = inject(MatSnackBar);
  private translateService = inject(TranslateService);
  private cachedDictionaryService = inject(CachedDictionaryService);
  private explorerUploadItemsService = inject(ExplorerUploadItemsService);

  @Output() startUpload = new EventEmitter<void>();
  @Output() removeItem = new EventEmitter<{
    item: FormGroup<UploadItemForm>;
    index: number;
  }>();
  @Output() openFileFolder = new EventEmitter<string>();
  @Output() closeOverlay = new EventEmitter<void>();

  readonly UploadingState = UploadItemState;
  startUploadButtonText = 'EXPLORER.UPLOAD_OVERLAY.START_UPLOAD_BUTTON_TEXT';
  startUploadButtonDisabled = false;

  uploadItems$: Observable<FormArray<FormGroup<UploadItemForm>>> =
    this.explorerUploadItemsService.uploadItems$.asObservable().pipe(
      tap((forms) => {
        const isUploading = forms.controls.some(
          (form) =>
            form.controls.uploadItem.value.state === UploadItemState.UPLOADING,
        );
        const uploadComplete = forms.controls.every(
          (form) =>
            form.controls.uploadItem.value.state === UploadItemState.UPLOADED,
        );
        if (isUploading) {
          this.modifyUploadingView(isUploading);
        } else {
          this.modifyUploadingView(
            false,
            'EXPLORER.UPLOAD_OVERLAY.START_UPLOAD_BUTTON_TEXT',
          );
        }
        if (uploadComplete) {
          this.modifyUploadingView(
            true,
            'EXPLORER.UPLOAD_OVERLAY.START_UPLOAD_BUTTON_TEXT_UPLOADING_COMPLETE_STATE',
          );
        }
      }),
    );

  securityLevelOptions$: Observable<Option[]> = this.cachedDictionaryService
    .getSecurityLevelOptions()
    .pipe(
      shareReplay(1),
      catchError(() => {
        this.snackBar.open(
          this.translateService.instant(
            'EXPLORER.ERRORS.SECURITY_LEVEL_OPTIONS_FETCH_ERROR',
          ),
          'close',
        );
        return EMPTY;
      }),
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
    uploadButtonDisabled: boolean,
    startUploadButtonText = 'EXPLORER.UPLOAD_OVERLAY.START_UPLOAD_BUTTON_TEXT_UPLOADING_STATE',
  ): void {
    this.startUploadButtonDisabled = uploadButtonDisabled;
    this.startUploadButtonText = startUploadButtonText;
  }
}
