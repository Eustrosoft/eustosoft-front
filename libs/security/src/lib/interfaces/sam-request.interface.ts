/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Subsystems, SupportedLanguages } from '@eustrosoft-front/core';
import { SamRequestActions } from '../constants/enums/sam-actions.enum';
import { Scopes } from '../constants/enums/scopes.enum';

interface BaseSamRequest {
  s: Subsystems;
  r: SamRequestActions;
  l: SupportedLanguages;
}

export interface UserIdRequest extends BaseSamRequest {
  s: Subsystems.SAM;
  r: SamRequestActions.USER_ID;
}

export interface UserLoginRequest extends BaseSamRequest {
  s: Subsystems.SAM;
  r: SamRequestActions.USER_LOGIN;
}

export interface UserLangRequest extends BaseSamRequest {
  s: Subsystems.SAM;
  r: SamRequestActions.USER_LANG;
}

export interface UserSlvlRequest extends BaseSamRequest {
  s: Subsystems.SAM;
  r: SamRequestActions.USER_SLVL;
}

export interface UserAvailableSlvlRequest extends BaseSamRequest {
  s: Subsystems.SAM;
  r: SamRequestActions.USER_AVAILABLE_SLVL;
}

export interface UserAvailableScopesRequest extends BaseSamRequest {
  s: Subsystems.SAM;
  r: SamRequestActions.USER_AVAILABLE_SCOPE;
  type: Scopes;
}

export interface UserDefaultScopeRequest extends BaseSamRequest {
  s: Subsystems.SAM;
  r: SamRequestActions.USER_DEFAULT_SCOPE;
}
