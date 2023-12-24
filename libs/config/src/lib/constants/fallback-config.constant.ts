/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Config } from '../interfaces/config.interface';

export const FallbackConfig: Config = {
  production: true,
  apiUrl: 'http://fudo.eustrosoft.org:8080/eustrosofthandler_war/api',
  shareUrl: 'https://dev37.qxyz.ru/ftpub',
  shareOWikiUrl: 'ftpub:',
  apps: [
    {
      title: 'HEADER.APPS.DISPATCHER',
      active: true,
      url: 'http://fudo.eustrosoft.org:8080/dispatcher/',
      icon: 'database',
    },
    {
      title: 'HEADER.APPS.EXPLORER',
      active: true,
      url: 'http://fudo.eustrosoft.org:8080/explorer/',
      icon: 'folder_open',
    },
    {
      title: 'HEADER.APPS.MSG',
      active: true,
      url: 'http://fudo.eustrosoft.org:8080/msg/',
      icon: 'chat',
    },
  ],
  loginUrl: 'http://fudo.eustrosoft.org:8080/login/',
  appsPageUrl: 'http://fudo.eustrosoft.org:8080/login/apps',
  homePageUrl: 'http://fudo.eustrosoft.org',
};
