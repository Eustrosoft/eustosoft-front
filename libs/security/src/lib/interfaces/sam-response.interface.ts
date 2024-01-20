/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Subsystems, SupportedLanguages } from '@eustrosoft-front/core';
import { SamRequestActions } from '../constants/enums/sam-actions.enum';

interface BaseSamResponse {
  s: Subsystems.SAM;
  r: SamRequestActions;
  e: number;
  m: string;
  l: SupportedLanguages;
}

export interface UserIdResponse extends BaseSamResponse {
  r: SamRequestActions.USER_ID;
  data: string;
}

export interface UserLoginResponse extends BaseSamResponse {
  r: SamRequestActions.USER_LOGIN;
  data: string;
}

export interface UserLangResponse extends BaseSamResponse {
  r: SamRequestActions.USER_LANG;
  data: string;
}

export interface UserSlvlResponse extends BaseSamResponse {
  r: SamRequestActions.USER_SLVL;
  data: string;
}

export interface UserAvailableSlvlResponse extends BaseSamResponse {
  r: SamRequestActions.USER_AVAILABLE_SLVL;
  data: string;
}

export interface UserAvailableScopesResponse extends BaseSamResponse {
  r: SamRequestActions.USER_AVAILABLE_SCOPE;
  zsid: number[];
}
