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
import { CoreModule, CustomLocationStrategy } from '@eustrosoft-front/core';
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
import { MatDialogModule } from '@angular/material/dialog';
import { MsgRequestBuilderService } from './support-chat/services/msg-request-builder.service';
import { MsgChatStatusPipe } from './support-chat/pipes/msg-chat-status.pipe';
import { VirtualScrollerModule } from '@iharbeck/ngx-virtual-scroller';
import { ChatMessageInputComponent } from './support-chat/components/chat-message-input/chat-message-input.component';
import { LocationStrategy } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NewLineToBrPipe } from './support-chat/pipes/new-line-to-br.pipe';
import { RenameChatDialogComponent } from './support-chat/components/rename-chat-dialog/rename-chat-dialog.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DicModule } from '@eustrosoft-front/dic';
import { MsgDictionaryService } from './support-chat/services/msg-dictionary.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MsgMapperService } from './support-chat/services/msg-mapper.service';

@NgModule({
  declarations: [
    AppComponent,
    SupportChatComponent,
    ChatListComponent,
    ChatViewComponent,
    LoginPageComponent,
    CreateChatDialogComponent,
    RenameChatDialogComponent,
    MsgChatStatusPipe,
    ChatMessageInputComponent,
    NewLineToBrPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    CoreModule,
    CommonUiModule,
    SecurityModule,
    DicModule,
    MatMenuModule,
    MatListModule,
    MatIconModule,
    MatDialogModule,
    VirtualScrollerModule,
    MatTooltipModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatExpansionModule,
  ],
  providers: [
    MsgRequestBuilderService,
    MsgDictionaryService,
    MsgMapperService,
    { provide: LocationStrategy, useClass: CustomLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
