/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { TestResult } from './test-case.interface';

export interface TestCaseResult {
  title: string;
  description: string;
  responseStatus?: string;
  errorText?: string;
  hideToggle?: boolean;
  response: unknown;
  result: TestResult;
}
