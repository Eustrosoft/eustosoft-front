/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from './services/login.service';
import { AuthenticationService } from './services/authentication.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfigModule } from '@eustrosoft-front/config';
import { UnauthenticatedInterceptor } from './interceptors/unauthenticated.interceptor';
import { WithCredentialsInterceptor } from './interceptors/with-credentials.interceptor';
import { SamService } from './services/sam.service';
import { DispatchService } from '@eustrosoft-front/core';

@NgModule({
  imports: [CommonModule, HttpClientModule, MatSnackBarModule, ConfigModule],
  providers: [
    LoginService,
    AuthenticationService,
    SamService,
    DispatchService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnauthenticatedInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WithCredentialsInterceptor,
      multi: true,
    },
  ],
})
export class SecurityModule {}
