/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  inject,
  Output,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogActions } from '@angular/material/dialog';
import { ShareDialogDataInterface } from './share-dialog-data.interface';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'eustrosoft-front-share-dialog',
    templateUrl: './share-dialog.component.html',
    styleUrls: ['./share-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatDialogTitle,
        NgIf,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatDialogActions,
        AsyncPipe,
        TranslateModule,
    ],
})
export class ShareDialogComponent {
  private readonly dialogRef = inject<
    MatDialogRef<ShareDialogComponent, string>
  >(MatDialogRef<ShareDialogComponent>);
  protected data = inject<ShareDialogDataInterface>(MAT_DIALOG_DATA);

  @Output() shareUrlCopied = new EventEmitter<string>();
  @Output() shareOWikiUrlCopied = new EventEmitter<string>();

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown(e: KeyboardEvent): void {
    e.stopPropagation();
    this.reject();
  }

  reject(): void {
    this.dialogRef.close();
  }
}
