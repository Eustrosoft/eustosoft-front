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
  Input,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UploadObjectForm } from '@eustrosoft-front/core';
import { Option } from '@eustrosoft-front/common-ui';
import { UploadingState } from '../../constants/enums/uploading-state.enum';

@Component({
  selector: 'eustrosoft-front-upload-object',
  templateUrl: './upload-object.component.html',
  styleUrls: ['./upload-object.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadObjectComponent {
  @Input() uploadObjectForm!: FormGroup<UploadObjectForm>;
  @Input() formIndex!: number;
  @Input() slvlOptions: Option[] = [];
  @Output() fileDeleted = new EventEmitter<number>();
  @Output() fileUploadCanceled = new EventEmitter<number>();

  UploadingState = UploadingState;
}
