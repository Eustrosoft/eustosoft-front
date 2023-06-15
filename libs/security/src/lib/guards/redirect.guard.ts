/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { APP_CONFIG, ConfigKey } from '@eustrosoft-front/config';
import { map, of, switchMap, tap } from 'rxjs';

export const redirectGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const config = inject(APP_CONFIG);
  const key: ConfigKey = route.data['key'];

  return config.pipe(
    switchMap((config) => of(config)),
    tap((config) => {
      window.location.href = config[key] as string;
    }),
    map(() => true)
  );
};
