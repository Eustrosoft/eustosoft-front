/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Route } from '@angular/router';
import { TestSuiteComponent } from './test-suite/test-suite.component';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    title: 'TIS | Test Suite',
    component: TestSuiteComponent,
  },
];
