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
import { UploadItem } from '@eustrosoft-front/core';
import { UploadingState } from '../../constants/enums/uploading-state.enum';
import { catchError, EMPTY, Observable, shareReplay } from 'rxjs';
import { Option } from '@eustrosoft-front/common-ui';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ExplorerDictionaryService } from '../../services/explorer-dictionary.service';

@Component({
  selector: 'eustrosoft-front-upload-overlay',
  templateUrl: './upload-overlay.component.html',
  styleUrls: ['./upload-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOverlayComponent {
  @Input() uploadItems!: UploadItem[];
  @Output() startUpload = new EventEmitter<void>();
  @Output() removeItem = new EventEmitter<UploadItem>();
  @Output() closeOverlay = new EventEmitter<UploadItem[]>();
  @Output() openFileFolder = new EventEmitter<string>();

  private snackBar = inject(MatSnackBar);
  private translateService = inject(TranslateService);
  private explorerDictionaryService = inject(ExplorerDictionaryService);

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

  openFolder(item: UploadItem): void {
    this.openFileFolder.emit(item.uploadPath);
  }

  remove(item: UploadItem): void {
    item.cancelled = true;
    this.removeItem.emit(item);
  }

  close(): void {
    this.closeOverlay.emit(this.uploadItems);
  }

  runUpload(): void {
    this.startUpload.emit();
  }
}
