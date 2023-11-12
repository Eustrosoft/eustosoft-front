/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export interface AuthenticatedUserInterface {
  userId: number;
  userFullName: string;
  userLogin: string;
  userLang: string;
  userSlvl: string;
  userAvailableSlvl: string;
}
