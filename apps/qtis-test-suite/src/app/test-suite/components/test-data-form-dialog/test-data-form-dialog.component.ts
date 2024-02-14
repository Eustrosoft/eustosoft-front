/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogActions,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { QtisTestFormService } from '@eustrosoft-front/qtis-test-suite-lib';
import {
  FileListComponent,
  InputFileComponent,
} from '@eustrosoft-front/common-ui';
import { CachedDictionaryService } from '@eustrosoft-front/dic';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';

@Component({
  selector: 'eustrosoft-front-test-data-form-dialog',
  templateUrl: './test-data-form-dialog.component.html',
  styleUrls: ['./test-data-form-dialog.component.scss'],
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
    InputFileComponent,
    FileListComponent,
  ],
})
export class TestDataFormDialogComponent implements OnInit {
  private readonly dialogRef = inject<
    MatDialogRef<TestDataFormDialogComponent>
  >(MatDialogRef<TestDataFormDialogComponent>);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly qtisTestFormService = inject(QtisTestFormService);
  protected readonly cachedDictionaryService = inject(CachedDictionaryService);

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown(e: KeyboardEvent): void {
    e.stopPropagation();
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.qtisTestFormService.form.controls.files.valueChanges
      .pipe(
        tap((files) => {
          this.qtisTestFormService.form.controls.filename.patchValue(
            files[0].name,
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  reject(): void {
    this.dialogRef.close();
  }

  resolve(): void {
    this.dialogRef.close();
  }
}
