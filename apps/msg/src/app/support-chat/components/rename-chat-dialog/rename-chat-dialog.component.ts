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
import { FormBuilder, Validators } from '@angular/forms';
import { RenameChatDialogFormInterface } from './rename-chat-dialog-form.interface';
import { RenameChatDialogDataInterface } from './rename-chat-dialog-data.interface';

@Component({
  selector: 'eustrosoft-front-create-chat-dialog',
  templateUrl: './rename-chat-dialog.component.html',
  styleUrls: ['./rename-chat-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenameChatDialogComponent {
  private dialogRef: MatDialogRef<RenameChatDialogComponent> = inject(
    MatDialogRef<RenameChatDialogComponent>
  );
  public data = inject<RenameChatDialogDataInterface>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group<RenameChatDialogFormInterface>({
    subject: this.fb.nonNullable.control(this.data.currentChatSubject, [
      Validators.required,
    ]),
  });

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown(e: KeyboardEvent) {
    e.stopPropagation();
    this.dialogRef.close(this.form.value);
  }

  reject(): void {
    this.dialogRef.close();
  }

  resolve(): void {
    this.dialogRef.close(this.form.value);
  }
}
