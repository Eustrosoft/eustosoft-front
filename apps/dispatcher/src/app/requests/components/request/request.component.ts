/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
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
import { InputFileComponent, Option } from '@eustrosoft-front/common-ui';
import { FormGroup } from '@angular/forms';
import { SingleRequestForm } from '../../interfaces/request.types';

@Component({
  selector: 'eustrosoft-front-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    const control = this.form.get('file');
    control?.value?.splice(index, 1);
    control?.patchValue(control?.value);
  }
}
