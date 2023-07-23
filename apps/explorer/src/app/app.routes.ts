/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Route } from '@angular/router';
import { ExplorerComponent } from './explorer/explorer.component';
import { authenticationGuard } from '@eustrosoft-front/security';
import { LoginPageComponent } from './login-page/login-page.component';
import { UploadPageComponent } from './explorer/components/upload-page/upload-page.component';
import { SupportChatComponent } from '@eustrosoft-front/common-ui';

export const appRoutes: Route[] = [
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'support-chat',
    component: SupportChatComponent,
  },
  {
    path: '',
    canActivate: [authenticationGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'TIS | Explorer',
        component: ExplorerComponent,
      },
      {
        path: 'upload',
        component: UploadPageComponent,
      },
    ],
  },
];
