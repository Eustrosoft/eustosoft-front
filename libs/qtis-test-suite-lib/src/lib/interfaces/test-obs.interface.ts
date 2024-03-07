/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { TestCaseResult } from './test-case-result.interface';

export type TestObs = {
  isLoading: boolean;
  isError: boolean;
  results: TestCaseResult[] | undefined;
};
