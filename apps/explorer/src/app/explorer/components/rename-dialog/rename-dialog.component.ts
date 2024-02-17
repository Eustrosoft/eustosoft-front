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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {
  RenameDialogData,
  RenameDialogForm,
  RenameDialogReturnData,
} from '@eustrosoft-front/explorer-lib';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'eustrosoft-front-create-fs-object-dialog',
  templateUrl: './rename-dialog.component.html',
  styleUrls: ['./rename-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatDialogTitle,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDialogActions,
    MatButtonModule,
    TranslateModule,
  ],
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
