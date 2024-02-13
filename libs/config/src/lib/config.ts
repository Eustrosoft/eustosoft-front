/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Provider } from '@angular/core';
import { APP_BASE_HREF, PlatformLocation } from '@angular/common';
import { APP_CONFIG, APP_CONFIG_SYNC } from './di/config.token';
import { ConfigService } from './services/config.service';

export function provideConfigLib(): Provider[] {
  return [
    {
      provide: APP_BASE_HREF,
      useFactory: (pl: PlatformLocation) => pl.getBaseHrefFromDOM(),
      deps: [PlatformLocation],
    },
    {
      provide: APP_CONFIG,
      useFactory: (configService: ConfigService) => configService.getConfig(),
      deps: [ConfigService],
    },
    {
      provide: APP_CONFIG_SYNC,
      useFactory: (configService: ConfigService) =>
        configService.getConfigSync(),
      deps: [ConfigService],
    },
  ];
}
