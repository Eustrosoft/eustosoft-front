/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
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
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RenameChatDialogFormInterface } from './rename-chat-dialog-form.interface';
import { RenameChatDialogDataInterface } from './rename-chat-dialog-data.interface';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'eustrosoft-front-create-chat-dialog',
    templateUrl: './rename-chat-dialog.component.html',
    styleUrls: ['./rename-chat-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatDialogActions,
        MatButtonModule,
        TranslateModule,
    ],
})
export class RenameChatDialogComponent {
  private dialogRef: MatDialogRef<RenameChatDialogComponent> = inject(
    MatDialogRef<RenameChatDialogComponent>,
  );
  public data = inject<RenameChatDialogDataInterface>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group<RenameChatDialogFormInterface>({
    subject: this.fb.nonNullable.control(this.data.currentChatSubject, [
      Validators.required,
    ]),
  });

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown(e: KeyboardEvent): void {
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
