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
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { MatListModule } from '@angular/material/list';
import { LoginPageComponent } from './login-page/login-page.component';
import { ChatsService } from './support-chat/services/chats.service';
import { ChatMessagesService } from './support-chat/services/chat-messages.service';
import { MatIconModule } from '@angular/material/icon';
import { CreateChatDialogComponent } from './support-chat/components/create-chat-dialog/create-chat-dialog.component';
import { MockService } from './support-chat/services/mock.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MsgService } from './support-chat/services/msg.service';
import { MsgRequestBuilderService } from './support-chat/services/msg-request-builder.service';
import { MsgChatStatusPipe } from './support-chat/pipes/msg-chat-status.pipe';

@NgModule({
  declarations: [
    AppComponent,
    SupportChatComponent,
    ChatListComponent,
    ChatViewComponent,
    LoginPageComponent,
    CreateChatDialogComponent,
    MsgChatStatusPipe,
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
  providers: [
    ChatsService,
    ChatMessagesService,
    MockService,
    MsgService,
    MsgRequestBuilderService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
