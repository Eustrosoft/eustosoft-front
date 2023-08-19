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
import {
  BehaviorSubject,
  combineLatest,
  filter,
  Observable,
  switchMap,
  take,
} from 'rxjs';
import { ChatsService } from './services/chats.service';
import { ChatMessagesService } from './services/chat-messages.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateChatDialogComponent } from './components/create-chat-dialog/create-chat-dialog.component';
import { CreateChatDialogDataInterface } from './components/create-chat-dialog/create-chat-dialog-data.interface';
import { CreateChatDialogReturnDataInterface } from './components/create-chat-dialog/create-chat-dialog-return-data.interface';
import { Chat, ChatMessage } from '@eustrosoft-front/core';

@Component({
  selector: 'eustrosoft-front-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportChatComponent implements OnInit {
  private chatsService = inject(ChatsService);
  private chatMessagesService = inject(ChatMessagesService);
  private dialog = inject(MatDialog);

  chats$!: Observable<Chat[]>;
  chatMessages$!: Observable<ChatMessage[]>;
  refreshChatsView$ = new BehaviorSubject(true);
  refreshChatMessagesView$ = new BehaviorSubject<number | undefined>(undefined);
  selectedChat: Chat | undefined = undefined;
  isCollapsed = true;
  isXs = false;

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.setUpSidebar();
  }

  ngOnInit(): void {
    this.chats$ = combineLatest([this.refreshChatsView$]).pipe(
      switchMap(() => this.chatsService.getChats())
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
        take(1)
      )
      .subscribe(console.log);
  }

  sendMessage(message: string) {
    console.log(`message: ${message}`);
    this.refreshChatMessagesView$.next(this.selectedChat?.id as number);
  }

  editMessage(message: ChatMessage) {
    console.log('message', message);
    this.refreshChatMessagesView$.next(this.selectedChat?.id as number);
  }
}
