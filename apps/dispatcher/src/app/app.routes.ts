/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Route } from '@angular/router';
import { RequestsComponent } from './requests/requests.component';
import { authenticationGuard } from '@eustrosoft-front/security';
import { LoginPageComponent } from './login-page/login-page.component';

export const appRoutes: Route[] = [
  {
    path: '',
    title: 'TIS | Dispatcher',
    component: RequestsComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'login',
    component: LoginPageComponent,
  },
];
