/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Config } from '../interfaces/config.interface';
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export const APP_CONFIG = new InjectionToken<Observable<Config>>(
  'Application configurations (environment)',
);
