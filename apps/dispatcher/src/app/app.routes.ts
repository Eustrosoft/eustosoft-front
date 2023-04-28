import { Route } from '@angular/router';
import { RequestsComponent } from './requests/requests.component';
import { AppComponent } from './app.component';
import { authenticationGuard, redirectGuard } from '@eustrosoft-front/security';
import { loginUrlKey } from '@eustrosoft-front/config';

export const appRoutes: Route[] = [
  {
    path: '',
    title: 'TIS | Dispatcher',
    component: RequestsComponent,
    canActivate: [authenticationGuard],
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
