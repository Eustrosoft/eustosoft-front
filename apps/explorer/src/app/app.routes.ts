import { Route } from '@angular/router';
import { ExplorerComponent } from './explorer/explorer.component';
import { AuthenticationGuard, RedirectGuard } from '@eustrosoft-front/security';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

export const appRoutes: Route[] = [
  {
    path: 'login',
    canActivate: [RedirectGuard],
    component: AppComponent,
    data: {
      externalUrl: environment.loginUrl,
    },
  },
  {
    path: '',
    pathMatch: 'full',
    title: 'TIS | Explorer',
    component: ExplorerComponent,
    canActivate: [AuthenticationGuard],
  },
];
