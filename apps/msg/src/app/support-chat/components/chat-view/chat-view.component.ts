/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  Chat,
  ChatMessage,
  MsgChatStatus,
  trackByZridFunction,
} from '@eustrosoft-front/core';
import { AuthenticationService } from '@eustrosoft-front/security';
import { shareReplay } from 'rxjs';
import { VirtualScrollerComponent } from '@iharbeck/ngx-virtual-scroller';

@Component({
  selector: 'eustrosoft-front-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatViewComponent implements OnChanges, AfterViewInit {
  @Input() selectedChat: Chat | undefined = undefined;
  private _selectedChatMessages!: ChatMessage[];
  @Input()
  set selectedChatMessages(value: ChatMessage[]) {
    this._selectedChatMessages = value;
  }
  get selectedChatMessages(): ChatMessage[] {
    return this._selectedChatMessages;
  }
  @Output() collapseClicked = new EventEmitter<void>();
  @Output() messageSent = new EventEmitter<string>();
  @Output() messageEdited = new EventEmitter<ChatMessage>();
  @Output() messageDeleted = new EventEmitter<ChatMessage>();
  @Output() closeChatClicked = new EventEmitter<Chat>();

  @ViewChild('messagesVirtualScrollViewport')
  messagesVirtualScrollViewport!: CdkVirtualScrollViewport;

  @ViewChild(VirtualScrollerComponent) vScroll!: VirtualScrollerComponent;

  private authenticationService = inject(AuthenticationService);

  control = new FormControl('', {
    nonNullable: true,
  });
  messageInEdit: ChatMessage | undefined = undefined;
  MSG_CHAT_STATUS = MsgChatStatus;
  trackByFn = trackByZridFunction;

  userInfo$ = this.authenticationService.userInfo$
    .asObservable()
    .pipe(shareReplay(1));

  ngOnChanges(changes: SimpleChanges): void {
    if ('selectedChat' in changes) {
      this.messageInEdit = undefined;
      this.scrollToBottom();
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  editMessage(message: ChatMessage) {
    this.messageInEdit = message;
  }

  saveEditedMessage(message: string) {
    const editedMessage: ChatMessage = {
      ...(this.messageInEdit as ChatMessage),
      content: message,
    };
    this.messageEdited.emit(editedMessage);
    this.messageInEdit = undefined;
  }

  sendMessage(message: string): void {
    this.messageSent.emit(message);
  }

  deleteMessage(message: ChatMessage): void {
    this.messageDeleted.emit(message);
    this.messageInEdit = undefined;
  }

  scrollToBottom(): void {
    this.vScroll?.scrollToIndex(
      this.selectedChatMessages.length - 1,
      true,
      10000,
      0
    );
  }

  closeChat(): void {
    this.closeChatClicked.emit(this.selectedChat);
  }
}
