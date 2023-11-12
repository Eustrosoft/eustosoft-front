/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Subsystems } from '../../constants/enums/subsystems.enum';
import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';
import { LoginActions } from '../../constants/enums/login-actions.enum';

export interface PingRequest {
  s: Subsystems.PING;
  l: SupportedLanguages;
}

export interface LoginRequest {
  s: Subsystems.LOGIN;
  r: LoginActions.LOGIN;
  l: SupportedLanguages;
  login: string;
  password: string;
}

export interface LogoutRequest {
  s: Subsystems.LOGIN;
  r: LoginActions.LOGOUT;
  l: SupportedLanguages;
}
