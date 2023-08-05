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
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SecurityModule } from '@eustrosoft-front/security';
import { SupportChatComponent } from './support-chat/support-chat.component';
import { TicketListComponent } from './support-chat/components/ticket-list/ticket-list.component';
import { TicketViewComponent } from './support-chat/components/ticket-view/ticket-view.component';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { MatListModule } from '@angular/material/list';
import { LoginPageComponent } from './login-page/login-page.component';
import { TicketsService } from './support-chat/services/tickets.service';
import { TicketMessagesService } from './support-chat/services/ticket-messages.service';
import { MatIconModule } from '@angular/material/icon';
import { CreateTicketDialogComponent } from './support-chat/components/create-ticket-dialog/create-ticket-dialog.component';
import { MockService } from './support-chat/services/mock.service';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    SupportChatComponent,
    TicketListComponent,
    TicketViewComponent,
    LoginPageComponent,
    CreateTicketDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    CoreModule,
    CommonUiModule,
    SecurityModule,
    MatMenuModule,
    CdkVirtualScrollViewport,
    MatListModule,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
    MatIconModule,
    MatDialogModule,
  ],
  providers: [TicketsService, TicketMessagesService, MockService],
  bootstrap: [AppComponent],
})
export class AppModule {}
