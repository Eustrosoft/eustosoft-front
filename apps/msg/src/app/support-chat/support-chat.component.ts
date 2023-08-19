/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { Chat } from './interfaces/chat.interface';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { ChatsService } from './services/chats.service';
import { ChatMessage } from './interfaces/chat-message.interface';
import { ChatMessagesService } from './services/chat-messages.service';
import { User } from './interfaces/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { CreateChatDialogComponent } from './components/create-chat-dialog/create-chat-dialog.component';
import { CreateChatDialogDataInterface } from './components/create-chat-dialog/create-chat-dialog-data.interface';
import { CreateChatDialogReturnDataInterface } from './components/create-chat-dialog/create-chat-dialog-return-data.interface';
import { MockService } from './services/mock.service';

@Component({
  selector: 'eustrosoft-front-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportChatComponent implements OnInit {
  private chatsService = inject(ChatsService);
  private chatMessagesService = inject(ChatMessagesService);
  private mockService = inject(MockService);
  private dialog = inject(MatDialog);

  chats$!: Observable<Chat[]>;
  chatMessages$!: Observable<ChatMessage[]>;
  refreshChatsView$ = new BehaviorSubject(true);
  refreshChatMessagesView$ = new BehaviorSubject<number | undefined>(undefined);
  selectedChat: Chat | undefined = undefined;
  selectedUser: User = { id: 1, name: 'User 1' };
  isCollapsed = true;
  isXs = false;

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.setUpSidebar();
  }

  ngOnInit(): void {
    this.chats$ = combineLatest([this.refreshChatsView$]).pipe(
      switchMap(() => this.chatsService.getChats(this.selectedUser.id))
    );
    this.chatMessages$ = combineLatest([
      this.refreshChatMessagesView$.pipe(
        filter((id): id is number => typeof id !== 'undefined')
      ),
    ]).pipe(switchMap(([id]) => this.chatMessagesService.getMessages(id)));
    this.setUpSidebar();
  }

  setUpSidebar() {
    if (window.innerWidth <= 576) {
      this.isCollapsed = true;
      this.isXs = true;
    } else {
      this.isCollapsed = false;
      this.isXs = false;
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  chatSelected(chat: Chat) {
    this.selectedChat = chat;
    this.refreshChatMessagesView$.next(chat.id);
  }

  userChanged(user: User) {
    this.selectedUser = user;
    this.refreshChatsView$.next(true);
    this.selectedChat = undefined;
  }

  createNewChat() {
    const dialogRef = this.dialog.open<
      CreateChatDialogComponent,
      CreateChatDialogDataInterface,
      CreateChatDialogReturnDataInterface
    >(CreateChatDialogComponent, {
      data: {
        title: 'Create new ticket',
        subjectInputLabel: 'Subject',
        messageInputLabel: 'Message',
        cancelButtonText: 'Cancel',
        submitButtonText: 'Create',
      },
      minHeight: '25vh',
      minWidth: '50vw',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter(
          (data): data is CreateChatDialogReturnDataInterface =>
            typeof data !== 'undefined'
        ),
        switchMap((chatData) => {
          const users: User[] = this.mockService.generateMockUsers(10);
          const chatUsers = this.mockService.getRandomUsers(
            users,
            Math.floor(Math.random() * 9) + 2
          );
          return combineLatest([of(chatData), of(chatUsers)]);
        }),
        switchMap(([chatData, chatUsers]) =>
          combineLatest([
            of(chatData),
            of(
              this.chatsService.addChats(
                chatData.subject,
                this.selectedUser,
                chatUsers
              )
            ),
          ])
        ),
        switchMap(([chatData, createdChat]) => {
          this.chatMessagesService.addMessage(
            createdChat.id,
            chatData.message,
            this.selectedUser
          );
          return of(createdChat);
        }),
        tap((createdChat) => {
          this.refreshChatsView$.next(true);
          this.chatSelected(createdChat);
        }),
        take(1)
      )
      .subscribe();
  }

  sendMessage(message: string) {
    this.chatMessagesService.addMessage(
      this.selectedChat?.id as number,
      message,
      this.selectedUser
    );
    this.refreshChatMessagesView$.next(this.selectedChat?.id as number);
  }

  editMessage(message: ChatMessage) {
    this.chatMessagesService.putMessage(message);
    this.refreshChatMessagesView$.next(this.selectedChat?.id as number);
  }
}
