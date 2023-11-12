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
import { LoginPageComponent } from './login-page/login-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@eustrosoft-front/core';
import { CommonUiModule } from '@eustrosoft-front/common-ui';
import { SecurityModule } from '@eustrosoft-front/security';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApplicationsComponent } from './applications/applications.component';
import { MatMenuModule } from '@angular/material/menu';
import { ConfigModule } from '@eustrosoft-front/config';

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
    ConfigModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
