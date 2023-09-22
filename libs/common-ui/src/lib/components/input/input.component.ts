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
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { InputTypes } from '@eustrosoft-front/core';
import { InputErrorInterface } from './input-error.interface';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'eustrosoft-front-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() fieldAppearance: MatFormFieldAppearance = 'fill';
  @Input() control!: FormControl;
  @Input() inputType: InputTypes = InputTypes.TEXT;
  @Input() suffixIcon = '';
  @Input() disabled = false;
  @Input() errors: InputErrorInterface[] = [];

  @Output() blurred = new EventEmitter<FocusEvent | undefined>();

  @ViewChild(MatInput) input!: MatInput;
}
