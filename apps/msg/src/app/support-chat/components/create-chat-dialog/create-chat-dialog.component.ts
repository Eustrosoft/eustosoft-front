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
  HostListener,
  inject,
  Output,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { CreateChatDialogFormInterface } from './create-chat-dialog-form.interface';
import { CreateChatDialogDataInterface } from './create-chat-dialog-data.interface';
import { CreateChatDialogReturnDataInterface } from './create-chat-dialog-return-data.interface';

@Component({
  selector: 'eustrosoft-front-create-chat-dialog',
  templateUrl: './create-chat-dialog.component.html',
  styleUrls: ['./create-chat-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateChatDialogComponent {
  @Output() formSubmitted = new EventEmitter<
    ReturnType<typeof this.form.getRawValue>
  >();

  private dialogRef: MatDialogRef<
    CreateChatDialogComponent,
    CreateChatDialogReturnDataInterface
  > = inject(
    MatDialogRef<CreateChatDialogComponent, CreateChatDialogReturnDataInterface>
  );
  private fb = inject(FormBuilder);
  public data: CreateChatDialogDataInterface = inject(MAT_DIALOG_DATA);

  form = this.fb.nonNullable.group<CreateChatDialogFormInterface>({
    subject: this.fb.nonNullable.control('', [Validators.required]),
    message: this.fb.nonNullable.control(''),
  });

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown(e: KeyboardEvent) {
    e.stopPropagation();
    this.formSubmitted.emit(this.form.getRawValue());
  }

  reject(): void {
    this.dialogRef.close();
  }

  resolve(): void {
    this.form.disable();
    this.formSubmitted.emit(this.form.getRawValue());
  }
}
