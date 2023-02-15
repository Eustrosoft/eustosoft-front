import { Route } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { AuthenticationGuard, RedirectGuard } from '@eustrosoft-front/security';
import { ApplicationsComponent } from './applications/applications.component';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    title: 'TIS | Login',
    component: LoginPageComponent,
  },
  {
    path: '',
    canActivate: [AuthenticationGuard],
    children: [
      {
        path: 'apps',
        title: 'TIS | Apps',
        component: ApplicationsComponent,
      },
      {
        path: 'explorer',
        canActivate: [RedirectGuard],
        component: ApplicationsComponent,
        data: {
          externalUrl: environment.explorerUrl,
        },
      },
      {
        path: 'dispatcher',
        canActivate: [RedirectGuard],
        component: ApplicationsComponent,
        data: {
          externalUrl: environment.dispatcherUrl,
        },
      },
    ],
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
