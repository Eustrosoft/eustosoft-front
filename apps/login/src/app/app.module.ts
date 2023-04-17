import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { APP_ENVIRONMENT } from '@eustrosoft-front/app-config';
import { environment } from '../environments/environment';
import { LoginPageComponent } from './login-page/login-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
  CoreModule,
  HttpErrorsInterceptorInterceptor,
} from '@eustrosoft-front/core';
import { CommonUiModule } from '@eustrosoft-front/common-ui';
import { SecurityModule } from '@eustrosoft-front/security';
import {
  MAT_ICON_DEFAULT_OPTIONS,
  MatIconDefaultOptions,
  MatIconModule,
} from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApplicationsComponent } from './applications/applications.component';
import { MatMenuModule } from '@angular/material/menu';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent, LoginPageComponent, ApplicationsComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    CommonUiModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    ReactiveFormsModule,
    SecurityModule,
    MatIconModule,
    MatMenuModule,
  ],
  providers: [
    { provide: APP_ENVIRONMENT, useValue: environment },
    {
      provide: MAT_ICON_DEFAULT_OPTIONS,
      useValue: {
        fontSet: 'material-symbols-outlined',
      } as MatIconDefaultOptions,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorsInterceptorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
