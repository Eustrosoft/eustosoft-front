/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Provider } from '@angular/core';
import { DAO_QSYS } from './di/dao.token';
import { DaoConfig, DispatchService, QSystem } from '@eustrosoft-front/dao-ts';

export function provideQtisTestSuiteLib(): Provider[] {
  return [
    {
      provide: DAO_QSYS,
      useFactory: () => {
        const config = DaoConfig.getInstance();
        // TODO Сделать конфигурируемым (config существует в виде Observable<Config> тут - все синхронно)
        //  Сделать конфиг доступным как синхронно так и через Observable<Config>
        //  Сделать конфиг доступным через Promise, эту функцию async и через await получить apiUrl
        config.apiUrl = 'http://localhost:4204/api/dispatch';
        const dispatchService = DispatchService.getInstance();
        return new QSystem(dispatchService);
      },
    },
  ];
}
