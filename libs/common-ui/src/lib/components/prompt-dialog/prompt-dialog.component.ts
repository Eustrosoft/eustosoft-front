/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PromptDialogDataInterface } from './prompt-dialog-data.interface';

@Component({
  selector: 'eustrosoft-front-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  styleUrls: ['./prompt-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptDialogComponent {
  private dialogRef: MatDialogRef<PromptDialogComponent> = inject(
    MatDialogRef<PromptDialogComponent>
  );
  public data: PromptDialogDataInterface = inject(MAT_DIALOG_DATA);

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown(e: KeyboardEvent) {
    e.stopPropagation();
    this.resolve();
  }

  reject(): void {
    this.dialogRef.close(false);
  }

  resolve(): void {
    this.dialogRef.close(true);
  }
}
