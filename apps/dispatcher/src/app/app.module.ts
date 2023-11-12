/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { CommonUiModule } from '@eustrosoft-front/common-ui';
import { CoreModule } from '@eustrosoft-front/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SecurityModule } from '@eustrosoft-front/security';
import { MatIconModule } from '@angular/material/icon';
import { RequestsComponent } from './requests/requests.component';
import { MatTableModule } from '@angular/material/table';
import { RequestService } from './requests/services/request.service';
import { RequestBuilderService } from './requests/services/request-builder.service';
import { RequestFormBuilderService } from './requests/services/request-form-builder.service';
import { RequestComponent } from './requests/components/request/request.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { ConfigModule } from '@eustrosoft-front/config';
import { LoginPageComponent } from './login-page/login-page.component';

@NgModule({
  declarations: [
    AppComponent,
    RequestsComponent,
    RequestComponent,
    LoginPageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    CommonUiModule,
    ConfigModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    ReactiveFormsModule,
    SecurityModule,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
  ],
  providers: [RequestService, RequestBuilderService, RequestFormBuilderService],
  bootstrap: [AppComponent],
})
export class AppModule {}
