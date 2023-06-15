/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';
import { Subsystems } from '../../constants/enums/subsystems.enum';

export interface PingResponse {
  s: Subsystems;
  e: number;
  m: string;
  l: SupportedLanguages;
  userId: string;
  fullName: string;
  username: string;
}

export interface LoginLogoutResponse {
  s: Subsystems;
  e: number;
  m: string;
  l: SupportedLanguages;
}
