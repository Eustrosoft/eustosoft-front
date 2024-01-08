/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
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
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import {
  BreakpointsService,
  HoverCursorDirective,
  HoverShadowDirective,
} from '@eustrosoft-front/common-ui';
import { MsgChatStatusPipe } from '../../pipes/msg-chat-status.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { VirtualScrollerModule } from '@iharbeck/ngx-virtual-scroller';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'eustrosoft-front-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    NgFor,
    MatCheckboxModule,
    NgIf,
    MatListModule,
    VirtualScrollerModule,
    HoverCursorDirective,
    HoverShadowDirective,
    MatDividerModule,
    TranslateModule,
    MsgChatStatusPipe,
  ],
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

  private readonly breakpointsService = inject(BreakpointsService);

  protected trackByFn = trackByZridFunction;
  protected checkedStatuses: { [key: string]: boolean } = {};
  protected isSm = this.breakpointsService.isSm();

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
      (optionValue) => this.checkedStatuses[optionValue],
    ) as MsgChatStatus[];
    this.statusFilterChanged.emit(codes);
  }
}
