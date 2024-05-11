/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import {
  SM_SCREEN_RESOLUTION,
  WINDOW,
  WINDOW_RESIZE_EVENT$,
} from '@eustrosoft-front/core';
import { distinctUntilChanged, map, Observable, startWith } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BreakpointsService {
  private readonly smScreenRes = inject(SM_SCREEN_RESOLUTION);
  private readonly window = inject(WINDOW);
  private readonly windowResizeEvent$ = inject(WINDOW_RESIZE_EVENT$);

  isSm(): Observable<boolean> {
    return this.windowResizeEvent$.pipe(
      map(() => this.window.innerWidth <= this.smScreenRes),
      startWith(this.window.innerWidth <= this.smScreenRes),
      distinctUntilChanged(),
    );
  }
}
