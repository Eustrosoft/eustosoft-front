/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export interface Config {
  production: boolean;
  apiUrl: string;
  shareUrl: string;
  loginUrl: string;
  dispatcherUrl: string;
  explorerUrl: string;
  appsPageUrl: string;
  homePageUrl: string;
}

export type ConfigKey = keyof Config;
