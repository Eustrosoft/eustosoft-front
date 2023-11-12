/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toNumber',
})
export class ToNumberPipe implements PipeTransform {
  transform(value: number | null | undefined): number {
    if (typeof value === null || typeof value === undefined) {
      throw new Error(`Can not convert ${typeof value} to number`);
    }
    return value as number;
  }
}
