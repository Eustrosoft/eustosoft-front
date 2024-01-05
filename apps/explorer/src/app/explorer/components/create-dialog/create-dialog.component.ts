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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreateDialogData } from './create-dialog-data.interface';
import { CreateDialogReturnData } from './create-dialog-return-data.interface';
import { CreateDialogForm } from './create-dialog-form.interface';
import { ExplorerDictionaryService } from '../../services/explorer-dictionary.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'eustrosoft-front-create-fs-object-dialog',
  templateUrl: './create-dialog.component.html',
  styleUrls: ['./create-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateDialogComponent {
  private readonly dialogRef = inject<
    MatDialogRef<CreateDialogComponent, CreateDialogReturnData>
  >(MatDialogRef<CreateDialogComponent>);
  private readonly translateService = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  private readonly explorerDictionaryService = inject(
    ExplorerDictionaryService,
  );
  protected readonly securityLevelOptions$ =
    this.explorerDictionaryService.securityOptions$;

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
