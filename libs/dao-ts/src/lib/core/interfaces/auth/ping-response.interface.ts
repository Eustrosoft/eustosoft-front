/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { SubsystemsEnum } from '../../../constants/enums/subsystems.enum';
import { SupportedLanguagesEnum } from '../../../constants/enums/supported-languages.enum';

export interface PingResponse {
  s: SubsystemsEnum;
  e: number;
  m: string;
  l: SupportedLanguagesEnum;
  userId: string;
  fullName: string;
  username: string;
  dbUser: string;
}
