/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Route } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { authenticationGuard } from '@eustrosoft-front/security';
import { ApplicationsComponent } from './applications/applications.component';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    title: 'TIS | Login',
    component: LoginPageComponent,
  },
  {
    path: '',
    canActivate: [authenticationGuard],
    children: [
      {
        path: 'apps',
        title: 'TIS | Apps',
        component: ApplicationsComponent,
      },
    ],
  },
];
