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
import { ChatListComponent } from './support-chat/components/chat-list/chat-list.component';
import { ChatViewComponent } from './support-chat/components/chat-view/chat-view.component';
import { MatListModule } from '@angular/material/list';
import { LoginPageComponent } from './login-page/login-page.component';
import { MatIconModule } from '@angular/material/icon';
import { CreateChatDialogComponent } from './support-chat/components/create-chat-dialog/create-chat-dialog.component';
import { MockService } from './support-chat/services/mock.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MsgRequestBuilderService } from './support-chat/services/msg-request-builder.service';
import { MsgChatStatusPipe } from './support-chat/pipes/msg-chat-status.pipe';
import { VirtualScrollerModule } from '@iharbeck/ngx-virtual-scroller';
import { ChatMessageInputComponent } from './support-chat/components/chat-message-input/chat-message-input.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    SupportChatComponent,
    ChatListComponent,
    ChatViewComponent,
    LoginPageComponent,
    CreateChatDialogComponent,
    MsgChatStatusPipe,
    ChatMessageInputComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    CoreModule,
    CommonUiModule,
    SecurityModule,
    MatMenuModule,
    MatListModule,
    MatIconModule,
    MatDialogModule,
    VirtualScrollerModule,
  ],
  providers: [
    MockService,
    MsgRequestBuilderService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
