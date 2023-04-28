import { Route } from '@angular/router';
import { ExplorerComponent } from './explorer/explorer.component';
import { authenticationGuard, redirectGuard } from '@eustrosoft-front/security';
import { AppComponent } from './app.component';
import { loginUrlKey } from '@eustrosoft-front/config';

export const appRoutes: Route[] = [
  {
    path: 'login',
    canActivate: [redirectGuard],
    component: AppComponent,
    data: {
      key: loginUrlKey,
    },
  },
  {
    path: '',
    pathMatch: 'full',
    title: 'TIS | Explorer',
    component: ExplorerComponent,
    canActivate: [authenticationGuard],
  },
];
