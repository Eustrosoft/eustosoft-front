/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Route } from '@angular/router';
import { ExplorerComponent } from './explorer/explorer.component';
import { authenticationGuard } from '@eustrosoft-front/security';
import { LoginPageComponent } from './login-page/login-page.component';
import { PdfPreviewComponent } from './explorer/components/pdf-preview/pdf-preview.component';

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
        title: 'TIS | Explorer',
        component: ExplorerComponent,
      },
      {
        path: 'pdf-preview',
        pathMatch: 'full',
        title: 'TIS | Explorer',
        component: PdfPreviewComponent,
      },
    ],
  },
];
