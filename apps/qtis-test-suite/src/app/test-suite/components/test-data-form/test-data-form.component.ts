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
  inject,
  OnInit,
} from '@angular/core';
import { QtisTestFormService } from '@eustrosoft-front/qtis-test-suite-lib';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import {
  FileListComponent,
  InputFileComponent,
} from '@eustrosoft-front/common-ui';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { SecurityLevels } from '@eustrosoft-front/security';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'eustrosoft-front-test-data-form',
  templateUrl: './test-data-form.component.html',
  styleUrls: ['./test-data-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    InputFileComponent,
    FileListComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    AsyncPipe,
    JsonPipe,
    MatCheckboxModule,
    MatTooltipModule,
  ],
})
export class TestDataFormComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly qtisTestFormService = inject(QtisTestFormService);
  protected readonly SecurityLevels = SecurityLevels;

  ngOnInit(): void {
    this.qtisTestFormService.form.controls.files.valueChanges
      .pipe(
        tap((files) => {
          this.qtisTestFormService.form.controls.fileName.patchValue(
            files[0]?.name,
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  deleteFile(index: number): void {
    const control = this.qtisTestFormService.form.controls.files;
    control?.value?.splice(index, 1);
    control?.patchValue(control?.value);
  }
}
