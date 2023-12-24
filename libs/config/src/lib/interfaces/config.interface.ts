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
  shareOWikiUrl: string;
  apps: App[];
  loginUrl: string;
  appsPageUrl: string;
  homePageUrl: string;
}

export interface App {
  title: string;
  active: boolean;
  url: string;
  icon: string;
}
