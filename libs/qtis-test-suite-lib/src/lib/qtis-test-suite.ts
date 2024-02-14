/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Provider } from '@angular/core';
import { DAO_FS, DAO_QSYS } from './di/dao.token';
import {
  DaoConfig,
  DispatchService,
  Fs,
  QSystem,
} from '@eustrosoft-front/dao-ts';
import { APP_CONFIG_SYNC, Config } from '@eustrosoft-front/config';
import { DOCUMENT } from '@angular/common';

export function provideQtisTestSuiteLib(): Provider[] {
  return [
    {
      provide: DAO_QSYS,
      useFactory: (cnf: Config, document: Document) => {
        const config = DaoConfig.getInstance();
        config.apiUrl = `${document.location.origin}${cnf.apiUrl}`;
        const dispatchService = DispatchService.getInstance();
        return new QSystem(dispatchService);
      },
      deps: [APP_CONFIG_SYNC, DOCUMENT],
    },
    {
      provide: DAO_FS,
      useFactory: (cnf: Config, document: Document) => {
        const config = DaoConfig.getInstance();
        config.apiUrl = `${document.location.origin}${cnf.apiUrl}`;
        const dispatchService = DispatchService.getInstance();
        return new Fs(dispatchService);
      },
      deps: [APP_CONFIG_SYNC, DOCUMENT],
    },
  ];
}
