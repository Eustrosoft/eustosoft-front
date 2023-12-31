/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  Chat,
  ChatMessage,
  MsgChatStatus,
  trackByZridFunction,
} from '@eustrosoft-front/core';
import { AuthenticationService } from '@eustrosoft-front/security';
import { shareReplay } from 'rxjs';

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
  @Output() reopenChatClicked = new EventEmitter<Chat>();

  @ViewChild('messagesScrollableBlock')
  messagesScrollableBlock!: ElementRef<HTMLDivElement>;

  private authenticationService = inject(AuthenticationService);
  private cdRef = inject(ChangeDetectorRef);

  messageInEdit: ChatMessage | undefined = undefined;
  MSG_CHAT_STATUS = MsgChatStatus;
  trackByFn = trackByZridFunction;

  userInfo$ = this.authenticationService.userInfo$
    .asObservable()
    .pipe(shareReplay(1));

  ngOnChanges(changes: SimpleChanges): void {
    if ('selectedChat' in changes) {
      this.messageInEdit = undefined;
    }

    // If scroll is at bottom and new messages were added -> call scrollToBottom
    if (
      'selectedChatMessages' in changes &&
      !changes['selectedChatMessages'].isFirstChange() &&
      changes['selectedChatMessages'].previousValue.length <
        changes['selectedChatMessages'].currentValue.length &&
      this.scrollAtBottom()
    ) {
      this.scrollToBottom();
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    this.cdRef.detectChanges();
    this.messagesScrollableBlock.nativeElement.scrollTop =
      this.messagesScrollableBlock.nativeElement.scrollHeight;
  }

  scrollAtBottom(): boolean {
    if (!this.messagesScrollableBlock) {
      return false;
    }
    return (
      Math.abs(
        this.messagesScrollableBlock.nativeElement.scrollHeight -
          this.messagesScrollableBlock.nativeElement.scrollTop -
          this.messagesScrollableBlock.nativeElement.clientHeight
      ) < 1
    );
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
    this.scrollToBottom();
  }

  deleteMessage(message: ChatMessage): void {
    this.messageDeleted.emit(message);
    this.messageInEdit = undefined;
  }

  closeChat(): void {
    this.closeChatClicked.emit(this.selectedChat);
  }

  editCanceled() {
    this.messageInEdit = undefined;
  }

  reopenChat() {
    this.reopenChatClicked.emit(this.selectedChat);
  }
}
