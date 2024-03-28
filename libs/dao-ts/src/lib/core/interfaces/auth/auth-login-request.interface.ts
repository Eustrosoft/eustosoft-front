/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { SubsystemsEnum } from '../../../constants/enums/subsystems.enum';
import { AuthActionsEnum } from '../../../constants/enums/auth-actions.enum';
import { SupportedLanguagesEnum } from '../../../constants/enums/supported-languages.enum';

export interface AuthLoginRequest {
  s: SubsystemsEnum.LOGIN;
  r: AuthActionsEnum.LOGIN;
  l: SupportedLanguagesEnum;
  login: string;
  password: string;
}
