/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { OriginReplaceString } from '@eustrosoft-front/config';
import { DOCUMENT } from '@angular/common';

@Pipe({
  name: 'replaceOrigin',
  standalone: true,
})
export class ReplaceOriginPipe implements PipeTransform {
  private readonly document = inject(DOCUMENT);

  transform(url: string): string {
    if (url.includes(OriginReplaceString)) {
      return url.replace(OriginReplaceString, this.document.location.origin);
    }
    return url;
  }
}
