/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormArray } from '@angular/forms';

@Pipe({
  name: 'formArray',
})
export class FormArrayPipe implements PipeTransform {
  transform(value: AbstractControl): FormArray {
    return value as FormArray;
  }
}
