/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Subsystems, SupportedLanguages } from '@eustrosoft-front/core';
import { DicRequestActions } from '../contants/enums/dic-actions.enum';

interface BaseDicRequest {
  s: Subsystems;
  r: DicRequestActions;
  l: SupportedLanguages;
}

export interface DicRequest extends BaseDicRequest {
  s: Subsystems.DIC;
  r: DicRequestActions.DICTIONARIES;
}

export interface DicValuesRequest extends BaseDicRequest {
  s: Subsystems.DIC;
  r: DicRequestActions.VALUES;
  dic: string;
}
