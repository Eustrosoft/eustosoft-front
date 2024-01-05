/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
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
import { InputError } from './input-error.interface';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'eustrosoft-front-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent<T extends string> {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() fieldAppearance: MatFormFieldAppearance = 'fill';
  @Input() control!: FormControl<T>;
  @Input() inputType: InputTypes = InputTypes.TEXT;
  @Input() showSuffixIcon = false;
  @Input() suffixIcon = '';
  @Input() disabled = false;
  @Input() hideSubscriptWrapper = false;
  @Input() errors: InputError[] = [];
  @Input()
  set value(value: T) {
    this.control.setValue(value);
  }
  get value(): T {
    return this.control.value;
  }

  @Output() blurred = new EventEmitter<FocusEvent | undefined>();

  @ViewChild(MatInput) input!: MatInput;
}
