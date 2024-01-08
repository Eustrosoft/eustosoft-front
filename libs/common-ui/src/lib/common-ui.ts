/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Provider } from '@angular/core';
import {
  MAT_ICON_DEFAULT_OPTIONS,
  MatIconDefaultOptions,
} from '@angular/material/icon';

export function provideCommonUiLib(): Provider[] {
  return [
    {
      provide: MAT_ICON_DEFAULT_OPTIONS,
      useValue: {
        fontSet: 'material-symbols-outlined',
      } as MatIconDefaultOptions,
    },
  ];
}
