/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Subsystems, SupportedLanguages } from '@eustrosoft-front/core';

interface BaseDispatcherResponse {
  s: Subsystems;
  l: SupportedLanguages;
}

export interface SqlResponse extends BaseDispatcherResponse {
  e: string;
  m: string;
  r: DispatcherTableResult[];
}

export interface DispatcherTableResult {
  columns: string[];
  data_types: string[];
  rows: unknown[][];
  rows_count: number;
}
