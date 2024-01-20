/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Subsystems, SupportedLanguages } from '@eustrosoft-front/core';

export interface PingResponse {
  s: Subsystems;
  e: number;
  m: string;
  l: SupportedLanguages;
  userId: string;
  fullName: string;
  username: string;
  dbUser: string;
}

export interface LoginLogoutResponse {
  s: Subsystems;
  e: number;
  m: string;
  l: SupportedLanguages;
}
