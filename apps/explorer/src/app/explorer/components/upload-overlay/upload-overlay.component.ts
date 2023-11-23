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
  Input,
  Output,
} from '@angular/core';
import { UploadItemForm } from '@eustrosoft-front/core';
import { UploadingState } from '../../constants/enums/uploading-state.enum';
import { catchError, EMPTY, Observable, shareReplay } from 'rxjs';
import { Option } from '@eustrosoft-front/common-ui';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ExplorerDictionaryService } from '../../services/explorer-dictionary.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

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
  private fb = inject(FormBuilder);

  @Input() uploadItems: FormArray<FormGroup<UploadItemForm>> = this.fb.array<
    FormGroup<UploadItemForm>
  >([]);
  @Output() startUpload = new EventEmitter<void>();
  @Output() removeItem = new EventEmitter<{
    item: FormGroup<UploadItemForm>;
    index: number;
  }>();
  @Output() closeOverlay = new EventEmitter<
    FormArray<FormGroup<UploadItemForm>>
  >();
  @Output() openFileFolder = new EventEmitter<string>();

  UploadingState = UploadingState;
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
    this.closeOverlay.emit(this.uploadItems);
  }

  runUpload(): void {
    this.startUpload.emit();
  }
}
