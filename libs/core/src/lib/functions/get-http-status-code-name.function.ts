/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { httpStatusCodeNames } from '../constants/http-status-code-names.constant';

export const getHttpStatusCodeName = (value: number): string => {
  return httpStatusCodeNames[value] || 'Unknown status';
};
