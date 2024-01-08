/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { provideConfigLib } from '@eustrosoft-front/config';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import {
  unauthenticatedInterceptor,
  withCredentialsInterceptor,
} from '@eustrosoft-front/security';
import { ReactiveFormsModule } from '@angular/forms';
import { appRoutes } from './app/app.routes';
import {
  PreloadAllModules,
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withPreloading,
} from '@angular/router';
import { provideCommonUiLib } from '@eustrosoft-front/common-ui';
import { provideAnimations } from '@angular/platform-browser/animations';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import {
  CustomLocationStrategy,
  httpErrorsInterceptorInterceptor,
  HttpLoaderFactory,
  provideCoreLib,
} from '@eustrosoft-front/core';
import { LocationStrategy } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      ReactiveFormsModule,
      MatIconModule,
      MatMenuModule,
      MatSidenavModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),
    provideHttpClient(
      withInterceptors([
        unauthenticatedInterceptor,
        withCredentialsInterceptor,
        httpErrorsInterceptorInterceptor,
      ]),
    ),
    provideRouter(
      appRoutes,
      withEnabledBlockingInitialNavigation(),
      withPreloading(PreloadAllModules),
    ),
    provideAnimations(),
    provideCoreLib(),
    provideCommonUiLib(),
    provideConfigLib(),
    { provide: LocationStrategy, useClass: CustomLocationStrategy },
  ],
}).catch((err) => console.error(err));
