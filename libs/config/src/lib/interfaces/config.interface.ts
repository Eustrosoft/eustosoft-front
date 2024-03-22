/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { MenuItem } from './menu-item.interface';
import { Link } from './link.interface';

export interface Config {
  production: boolean;
  apiUrl: string;
  shareUrl: string;
  shareOWikiUrl: string;
  apps: App[];
  sideNavMenuItems: SideNavMenuItems;
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

export interface SideNavMenuItems {
  dropdowns: MenuItem[];
  rest: Link[];
}
