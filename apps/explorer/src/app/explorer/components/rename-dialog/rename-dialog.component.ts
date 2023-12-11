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
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RenameDialogData } from './rename-dialog-data.interface';
import { RenameDialogForm } from './rename-dialog-form.interface';
import { RenameDialogReturnData } from './rename-dialog-return-data.interface';

@Component({
  selector: 'eustrosoft-front-create-fs-object-dialog',
  templateUrl: './rename-dialog.component.html',
  styleUrls: ['./rename-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenameDialogComponent {
  private readonly dialogRef = inject<
    MatDialogRef<RenameDialogComponent, RenameDialogReturnData>
  >(MatDialogRef<RenameDialogComponent>);
  private readonly fb = inject(FormBuilder);
  protected data = inject<RenameDialogData>(MAT_DIALOG_DATA);

  protected form = this.fb.nonNullable.group<RenameDialogForm>({
    name: this.fb.nonNullable.control(this.data.nameInputValue, [
      Validators.required,
    ]),
    description: this.fb.nonNullable.control(this.data.descriptionInputValue),
  });

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown(e: KeyboardEvent): void {
    e.stopPropagation();
    this.dialogRef.close(this.form.getRawValue());
  }

  reject(): void {
    this.dialogRef.close();
  }

  resolve(): void {
    this.dialogRef.close(this.form.getRawValue());
  }
}
