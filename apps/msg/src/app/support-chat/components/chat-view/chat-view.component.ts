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
export class ChatViewComponent implements OnChanges {
  @Input() selectedChat: Chat | undefined = undefined;
  private _selectedChatMessages!: ChatMessage[];
  @Input()
  set selectedChatMessages(value: ChatMessage[]) {
    this._selectedChatMessages = value;
    this.vScroll?.scrollToIndex(value.length - 1, true, 0, 0);
  }
  get selectedChatMessages(): ChatMessage[] {
    return this._selectedChatMessages;
  }
  @Output() collapseClicked = new EventEmitter<void>();
  @Output() messageSent = new EventEmitter<string>();
  @Output() messageEdited = new EventEmitter<ChatMessage>();
  @Output() messageDeleted = new EventEmitter<ChatMessage>();

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

  editMessage(message: ChatMessage) {
    this.messageInEdit = message;
    this.control.setValue(message.content);
  }

  saveEditedMessage() {
    const editedMessage: ChatMessage = {
      ...(this.messageInEdit as ChatMessage),
      content: this.control.value,
    };
    this.messageEdited.emit(editedMessage);
    this.messageInEdit = undefined;
    this.control.setValue('');
  }

  sendMessage(): void {
    if (this.control.value.length === 0) {
      return;
    }
    this.messageSent.emit(this.control.value);
    this.control.reset();
  }

  deleteMessage(message: ChatMessage): void {
    this.messageDeleted.emit(message);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('selectedChat' in changes) {
      this.messageInEdit = undefined;
      this.control.reset();
    }
  }
}
