/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Chat, trackByZridFunction } from '@eustrosoft-front/core';

@Component({
  selector: 'eustrosoft-front-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListComponent {
  @Input() chats!: Chat[];
  @Input() selectedChat: Chat | undefined = undefined;
  @Input() removeBorderRadius!: boolean;
  @Output() chatSelected = new EventEmitter<Chat>();
  @Output() renameChatClicked = new EventEmitter<Chat>();
  @Output() deleteChatClicked = new EventEmitter<Chat>();
  @Output() collapseClicked = new EventEmitter<void>();
  @Output() newChatCreateClicked = new EventEmitter<void>();
  @Output() refreshChatsClicked = new EventEmitter<void>();

  trackByFn = trackByZridFunction;

  selectChat(chat: Chat) {
    this.selectedChat = chat;
    this.chatSelected.emit(chat);
  }

  createNewChat() {
    this.newChatCreateClicked.emit();
  }

  renameChat(chat: Chat) {
    this.renameChatClicked.emit(chat);
  }

  deleteChat(chat: Chat) {
    this.deleteChatClicked.emit(chat);
  }

  refreshChats() {
    this.refreshChatsClicked.emit();
  }
}
