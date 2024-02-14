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
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { CreateDialogData } from './create-dialog-data.interface';
import { CreateDialogReturnData } from './create-dialog-return-data.interface';
import { CreateDialogForm } from './create-dialog-form.interface';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CachedDictionaryService } from '@eustrosoft-front/dic';

@Component({
  selector: 'eustrosoft-front-create-fs-object-dialog',
  templateUrl: './create-dialog.component.html',
  styleUrls: ['./create-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatDialogTitle,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    MatDialogActions,
    MatButtonModule,
    AsyncPipe,
    TranslateModule,
  ],
})
export class CreateDialogComponent {
  private readonly dialogRef = inject<
    MatDialogRef<CreateDialogComponent, CreateDialogReturnData>
  >(MatDialogRef<CreateDialogComponent>);
  private readonly translateService = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  private readonly cachedDictionaryService = inject(CachedDictionaryService);
  protected readonly securityLevelOptions$ =
    this.cachedDictionaryService.securityOptions$;

  protected data = inject<CreateDialogData>(MAT_DIALOG_DATA);
  protected form: FormGroup<CreateDialogForm> = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control(
      this.translateService.instant(this.data.nameInputDefaultValue),
      [Validators.required],
    ),
    securityLevel: this.fb.nonNullable.control(
      this.data.securityLevelSelectDefaultValue,
    ),
    description: this.fb.nonNullable.control(
      this.data.descriptionInputDefaultValue,
    ),
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
