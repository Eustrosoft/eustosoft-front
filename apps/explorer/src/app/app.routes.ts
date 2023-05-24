import { Route } from '@angular/router';
import { ExplorerComponent } from './explorer/explorer.component';
import { authenticationGuard } from '@eustrosoft-front/security';
import { LoginPageComponent } from './login-page/login-page.component';
import { UploadPageComponent } from './explorer/components/upload-page/upload-page.component';

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
        path: 'upload',
        component: UploadPageComponent,
      },
    ],
  },
];
