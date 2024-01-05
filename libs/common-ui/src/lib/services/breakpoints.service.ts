/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SM_SCREEN_RESOLUTION } from '@eustrosoft-front/core';

@Injectable()
export class BreakpointsService {
  private readonly smScreenRes = inject(SM_SCREEN_RESOLUTION);
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;

  isSm(): boolean {
    if (!this.window) {
      return false;
    }
    return this.window.innerWidth <= this.smScreenRes;
  }
}
