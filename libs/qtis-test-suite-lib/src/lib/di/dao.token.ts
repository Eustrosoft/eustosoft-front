/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { InjectionToken } from '@angular/core';
import { QSystem } from '@eustrosoft-front/dao-ts';

export const DAO_QSYS = new InjectionToken<QSystem>('DAO QSystem Class');
