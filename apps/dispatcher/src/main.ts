/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
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
import { provideConfigLib } from '@eustrosoft-front/config';
import { provideCommonUiLib } from '@eustrosoft-front/common-ui';
import { provideAnimations } from '@angular/platform-browser/animations';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import {
  CustomLocationStrategy,
  httpErrorsInterceptor,
  HttpLoaderFactory,
  provideCoreLib,
} from '@eustrosoft-front/core';
import { LocationStrategy } from '@angular/common';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      ReactiveFormsModule,
      MatTableModule,
      MatIconModule,
      MatMenuModule,
      MatSidenavModule,
      MatFormFieldModule,
      MatOptionModule,
      MatSelectModule,
      MatButtonModule,
      MatInputModule,
      TextFieldModule,
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
    { provide: LocationStrategy, useClass: CustomLocationStrategy },
  ],
}).catch((err) => console.error(err));
