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
import { ImgPreviewComponent } from './explorer/components/img-preview/img-preview.component';
import { TxtPreviewComponent } from './explorer/components/txt-preview/txt-preview.component';
import { ExplorerRoutes } from '@eustrosoft-front/explorer-lib';

export const appRoutes: Route[] = [
  {
    path: ExplorerRoutes.Login,
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
        path: ExplorerRoutes.PdfPreview,
        pathMatch: 'full',
        title: 'TIS | Explorer',
        component: PdfPreviewComponent,
      },
      {
        path: ExplorerRoutes.ImgPreview,
        pathMatch: 'full',
        title: 'TIS | Explorer',
        component: ImgPreviewComponent,
      },
      {
        path: ExplorerRoutes.TxtPreview,
        pathMatch: 'full',
        title: 'TIS | Explorer',
        component: TxtPreviewComponent,
      },
    ],
  },
];
