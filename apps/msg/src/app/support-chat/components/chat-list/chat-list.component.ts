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
  OnInit,
  Output,
} from '@angular/core';
import {
  Chat,
  ChatVersion,
  DicValue,
  MsgChatStatus,
  trackByZridFunction,
} from '@eustrosoft-front/core';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'eustrosoft-front-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListComponent implements OnInit {
  @Input() chats!: Chat[];
  @Input() chatVersions!: ChatVersion[];
  @Input() selectedChat: Chat | undefined = undefined;
  @Input() removeBorderRadius!: boolean;
  @Input() chatStatusFilterOptions!: DicValue[];
  @Output() chatSelected = new EventEmitter<Chat>();
  @Output() renameChatClicked = new EventEmitter<Chat>();
  @Output() deleteChatClicked = new EventEmitter<Chat>();
  @Output() collapseClicked = new EventEmitter<void>();
  @Output() newChatCreateClicked = new EventEmitter<void>();
  @Output() refreshChatsClicked = new EventEmitter<void>();
  @Output() statusFilterChanged = new EventEmitter<MsgChatStatus[]>();

  trackByFn = trackByZridFunction;
  checkedStatuses: { [key: string]: boolean } = {};

  ngOnInit(): void {
    this.chatStatusFilterOptions.forEach((option) => {
      this.checkedStatuses[option.code] = false;
    });
  }

  selectChat(chat: Chat): void {
    this.selectedChat = chat;
    this.chatSelected.emit(chat);
  }

  createNewChat(): void {
    this.newChatCreateClicked.emit();
  }

  renameChat(chat: Chat): void {
    this.renameChatClicked.emit(chat);
  }

  deleteChat(chat: Chat): void {
    this.deleteChatClicked.emit(chat);
  }

  refreshChats(): void {
    this.refreshChatsClicked.emit();
  }

  filterChange(event: MatCheckboxChange, value: string): void {
    this.checkedStatuses[value] = event.checked;
    const codes = Object.keys(this.checkedStatuses).filter(
      (optionValue) => this.checkedStatuses[optionValue]
    ) as MsgChatStatus[];
    this.statusFilterChanged.emit(codes);
  }
}
