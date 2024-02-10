/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import {
  PreloadAllModules,
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withPreloading,
} from '@angular/router';
import { appRoutes } from './app/app.routes';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  unauthenticatedInterceptor,
  withCredentialsInterceptor,
} from '@eustrosoft-front/security';
import {
  CustomLocationStrategy,
  httpErrorsInterceptor,
  HttpLoaderFactory,
  provideCoreLib,
} from '@eustrosoft-front/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideCommonUiLib } from '@eustrosoft-front/common-ui';
import { provideConfigLib } from '@eustrosoft-front/config';
import { LocationStrategy } from '@angular/common';
import { importProvidersFrom } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { provideQtisTestSuiteLib } from '@eustrosoft-front/qtis-test-suite-lib';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
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
        httpErrorsInterceptor,
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
    provideQtisTestSuiteLib(),
    { provide: LocationStrategy, useClass: CustomLocationStrategy },
  ],
}).catch((err) => console.error(err));
