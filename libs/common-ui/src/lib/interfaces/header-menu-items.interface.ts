/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { MenuItem } from './menu-item.interface';
import { Link } from './link.interface';

export interface HeaderMenuItems {
  dropdowns: MenuItem[];
  rest: Link[];
}
