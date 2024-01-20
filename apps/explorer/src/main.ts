/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { CdkFixedSizeVirtualScroll } from '@angular/cdk/scrolling';
import { MatDialogModule } from '@angular/material/dialog';
import { PortalModule } from '@angular/cdk/portal';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import {
  unauthenticatedInterceptor,
  withCredentialsInterceptor,
} from '@eustrosoft-front/security';
import { provideCommonUiLib } from '@eustrosoft-front/common-ui';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { appRoutes } from './app/app.routes';
import {
  PreloadAllModules,
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withPreloading,
} from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import {
  CustomLocationStrategy,
  httpErrorsInterceptor,
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
import { provideConfigLib } from '@eustrosoft-front/config';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      MatTableModule,
      MatSortModule,
      MatCheckboxModule,
      MatIconModule,
      MatProgressBarModule,
      MatMenuModule,
      MatBottomSheetModule,
      PortalModule,
      MatDialogModule,
      CdkFixedSizeVirtualScroll,
      MatListModule,
      MatTooltipModule,
      MatCardModule,
      MatExpansionModule,
      MatSidenavModule,
      MatButtonModule,
      MatFormFieldModule,
      MatInputModule,
      ReactiveFormsModule,
      MatOptionModule,
      MatSelectModule,
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
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 7000 } },
  ],
}).catch((err) => console.error(err));
