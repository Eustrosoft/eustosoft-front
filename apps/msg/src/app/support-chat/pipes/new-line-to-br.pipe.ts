/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newLineToBr',
})
export class NewLineToBrPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return value;
    }

    // Escape < and > characters to prevent HTML interpretation
    value = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Replace newline characters with <br> tags
    return value.replace(/\n/g, '<br>');
  }
}
