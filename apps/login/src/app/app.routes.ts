/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Route } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { authenticationGuard, redirectGuard } from '@eustrosoft-front/security';
import { ApplicationsComponent } from './applications/applications.component';
import { AppComponent } from './app.component';
import {
  dispatcherUrlKey,
  explorerUrlKey,
  loginUrlKey,
} from '@eustrosoft-front/config';

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
      {
        path: 'explorer',
        canActivate: [redirectGuard],
        component: ApplicationsComponent,
        data: {
          key: explorerUrlKey,
        },
      },
      {
        path: 'dispatcher',
        canActivate: [redirectGuard],
        component: ApplicationsComponent,
        data: {
          key: dispatcherUrlKey,
        },
      },
    ],
  },
  {
    path: 'login',
    canActivate: [redirectGuard],
    component: AppComponent,
    data: {
      key: loginUrlKey,
    },
  },
];
