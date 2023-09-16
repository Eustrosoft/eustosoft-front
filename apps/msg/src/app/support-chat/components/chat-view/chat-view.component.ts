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
import { Chat, ChatMessage, MsgChatStatus } from '@eustrosoft-front/core';
import { AuthenticationService } from '@eustrosoft-front/security';
import { shareReplay } from 'rxjs';

@Component({
  selector: 'eustrosoft-front-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatViewComponent implements OnChanges {
  @Input() selectedChat: Chat | undefined = undefined;
  @Input() selectedChatMessages!: ChatMessage[];
  @Output() collapseClicked = new EventEmitter<void>();
  @Output() messageSent = new EventEmitter<string>();
  @Output() messageEdited = new EventEmitter<ChatMessage>();
  @Output() messageDeleted = new EventEmitter<ChatMessage>();

  @ViewChild('messagesVirtualScrollViewport')
  messagesVirtualScrollViewport!: CdkVirtualScrollViewport;

  private authenticationService = inject(AuthenticationService);

  control = new FormControl('', {
    nonNullable: true,
  });
  messageInEdit: ChatMessage | undefined = undefined;
  MSG_CHAT_STATUS = MsgChatStatus;

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

  sendMessage() {
    if (this.control.value.length === 0) {
      return;
    }
    this.messageSent.emit(this.control.value);
    this.control.reset();
  }

  deleteMessage(message: ChatMessage) {
    this.messageDeleted.emit(message);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('selectedChat' in changes) {
      this.messageInEdit = undefined;
      this.control.reset();
    }
  }

  // scrollToBottom() {
  //   // TODO работает не корректно, то скроллит на середину, то в конец, то не скроллит вовсе, нужно переделывать
  //   setTimeout(() => {
  //     this.messagesVirtualScrollViewport.scrollTo({
  //       bottom: 0,
  //       behavior: 'auto',
  //     });
  //   }, 10);
  // }
  //
  // ngOnChanges(changes: SimpleChanges): void {
  //   if ('selectedTicket' in changes) {
  //     this.scrollToBottom();
  //   }
  // }

  // ngAfterViewInit(): void {
  //   this.scrollToBottom();
  // }
}
