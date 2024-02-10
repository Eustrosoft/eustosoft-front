/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Provider } from '@angular/core';
import { DAO_QSYS } from './di/dao.token';
import { DispatchService, QSystem } from '@eustrosoft-front/dao-ts';

export function provideQtisTestSuiteLib(): Provider[] {
  return [
    {
      provide: DAO_QSYS,
      useFactory: () => {
        const dispatchService = DispatchService.getInstance();
        return new QSystem(dispatchService);
      },
    },
  ];
}
