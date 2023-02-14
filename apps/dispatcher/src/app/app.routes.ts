import { Route } from '@angular/router';
import { RequestsComponent } from './requests/requests.component';
import { RedirectGuard } from '@eustrosoft-front/security';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

export const appRoutes: Route[] = [
  {
    path: '',
    title: 'TIS | Dispatcher',
    component: RequestsComponent,
  },
  {
    path: 'login',
    canActivate: [RedirectGuard],
    component: AppComponent,
    data: {
      externalUrl: environment.loginUrl,
    },
  },
];
