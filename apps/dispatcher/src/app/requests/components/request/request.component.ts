/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { DispatcherQueryTypes } from '@eustrosoft-front/core';
import {
  FileListComponent,
  InputFileComponent,
  Option,
} from '@eustrosoft-front/common-ui';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SingleRequestForm } from '../../interfaces/request.types';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'eustrosoft-front-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    NgFor,
    MatOptionModule,
    NgIf,
    MatInputModule,
    FileListComponent,
    InputFileComponent,
  ],
})
export class RequestComponent {
  @Input() form!: FormGroup<SingleRequestForm>;
  @Input() formNumber!: number;
  @Input() queryTypeOptions: Option[] = Object.values(DispatcherQueryTypes).map(
    (queryType) =>
      ({
        value: queryType,
        displayText: queryType,
        disabled: false,
      }) as Option,
  );

  @ViewChild(InputFileComponent) inputFileComponent!: InputFileComponent;
  public QueryTypes = DispatcherQueryTypes;

  public queryTypeLabelText = 'Query type';

  deleteFile(index: number): void {
    const control = this.form.controls.file;
    control?.value?.splice(index, 1);
    control?.patchValue(control?.value);
  }
}
