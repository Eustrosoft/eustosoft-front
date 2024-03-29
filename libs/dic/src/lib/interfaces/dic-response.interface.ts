/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Subsystems, SupportedLanguages } from '@eustrosoft-front/core';
import { DicRequestActions } from '../contants/enums/dic-actions.enum';
import { DicValue } from './dic-value.interface';

interface BaseDicResponse {
  s: Subsystems.DIC;
  r: DicRequestActions;
  e: number;
  m: string;
  l: SupportedLanguages;
}

export interface DicsResponse extends BaseDicResponse {
  r: DicRequestActions.DICTIONARIES;
  dics: string[];
}

export interface DicValuesResponse extends BaseDicResponse {
  r: DicRequestActions.VALUES;
  values: DicValue[];
}
