import { Route } from '@angular/router';
import { RequestsComponent } from './requests/requests.component';
import { AuthenticationGuard, RedirectGuard } from '@eustrosoft-front/security';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

export const appRoutes: Route[] = [
  {
    path: '',
    title: 'TIS | Dispatcher',
    component: RequestsComponent,
    canActivate: [AuthenticationGuard],
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
