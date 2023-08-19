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
import { Chat } from '@eustrosoft-front/core';

@Component({
  selector: 'eustrosoft-front-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListComponent {
  @Input() chats!: Chat[];
  @Input() removeBorderRadius!: boolean;
  @Output() chatSelected = new EventEmitter<Chat>();
  @Output() collapseClicked = new EventEmitter<void>();
  @Output() newChatCreateClicked = new EventEmitter<void>();

  selectedChat: Chat | undefined = undefined;
  numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  selectChat(chat: Chat) {
    this.selectedChat = chat;
    this.chatSelected.emit(chat);
  }

  createNewChat() {
    this.newChatCreateClicked.emit();
  }
}
