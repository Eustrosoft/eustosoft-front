/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { User } from './user.interface';

export interface Ticket {
  id: number;
  name: string;
  time_created: string;
  owner: User;
  users: User[];
  active: boolean;
}
