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
import { CreateChatDialogFormInterface } from './create-chat-dialog-form.interface';
import { CreateChatDialogDataInterface } from './create-chat-dialog-data.interface';

@Component({
  selector: 'eustrosoft-front-create-chat-dialog',
  templateUrl: './create-chat-dialog.component.html',
  styleUrls: ['./create-chat-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateChatDialogComponent {
  private dialogRef: MatDialogRef<CreateChatDialogComponent> = inject(
    MatDialogRef<CreateChatDialogComponent>
  );
  public data: CreateChatDialogDataInterface = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group<CreateChatDialogFormInterface>({
    subject: this.fb.nonNullable.control('', [Validators.required]),
    message: this.fb.nonNullable.control('', [Validators.required]),
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
