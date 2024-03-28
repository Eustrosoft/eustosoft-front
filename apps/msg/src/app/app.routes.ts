/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Route } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { SupportChatComponent } from './support-chat/support-chat.component';
import { authenticationGuard } from '@eustrosoft-front/security';

export const appRoutes: Route[] = [
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: '',
    canActivate: [authenticationGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'TIS | Msg',
        component: SupportChatComponent,
      },
    ],
  },
];
