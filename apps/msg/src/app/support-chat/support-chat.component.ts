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
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CreateChatDialogComponent } from './components/create-chat-dialog/create-chat-dialog.component';
import { CreateChatDialogDataInterface } from './components/create-chat-dialog/create-chat-dialog-data.interface';
import { CreateChatDialogReturnDataInterface } from './components/create-chat-dialog/create-chat-dialog-return-data.interface';
import {
  Chat,
  ChatMessage,
  CreateChatRequest,
  CreateChatResponse,
  MessageType,
  QtisRequestResponseInterface,
  ViewChatRequest,
  ViewChatResponse,
  ViewChatsRequest,
  ViewChatsResponse,
} from '@eustrosoft-front/core';
import { MsgRequestBuilderService } from './services/msg-request-builder.service';
import { DispatchService, SamService } from '@eustrosoft-front/security';

@Component({
  selector: 'eustrosoft-front-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportChatComponent implements OnInit {
  private dispatchService = inject(DispatchService);
  private msgRequestBuilderService = inject(MsgRequestBuilderService);
  private samService = inject(SamService);
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
      switchMap(() => this.msgRequestBuilderService.buildViewChatsRequest()),
      switchMap((req: QtisRequestResponseInterface<ViewChatsRequest>) =>
        this.dispatchService.dispatch<ViewChatsRequest, ViewChatsResponse>(req)
      ),
      map((response: QtisRequestResponseInterface<ViewChatsResponse>) =>
        response.r.flatMap((r: ViewChatsResponse) => r.chats)
      ),
      tap(console.log)
    );

    this.chatMessages$ = combineLatest([
      this.refreshChatMessagesView$.pipe(
        filter((zoid): zoid is number => typeof zoid !== 'undefined')
      ),
    ]).pipe(
      switchMap(([zoid]) =>
        this.msgRequestBuilderService.buildViewChatRequest(zoid)
      ),
      switchMap((req: QtisRequestResponseInterface<ViewChatRequest>) =>
        this.dispatchService.dispatch<ViewChatRequest, ViewChatResponse>(req)
      ),
      map((response: QtisRequestResponseInterface<ViewChatResponse>) =>
        response.r.flatMap((r: ViewChatResponse) => r.messages)
      ),
      tap(console.log)
    );

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
    this.refreshChatMessagesView$.next(chat.zoid);
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
        switchMap((data) =>
          combineLatest([
            of(data),
            this.samService.getUserSlvl().pipe(map((slvl) => slvl.r[0].data)),
            this.samService.getUserId(),
          ])
        ),
        switchMap(([content, slvl, userId]) => {
          console.log(userId);
          return this.msgRequestBuilderService.buildCreateChatRequest({
            content: content.subject,
            slvl: +slvl,
          });
        }),
        switchMap((req) =>
          this.dispatchService.dispatch<CreateChatRequest, CreateChatResponse>(
            req
          )
        ),
        take(1)
      )
      .subscribe(console.log);
  }

  sendMessage(message: string) {
    this.msgRequestBuilderService
      .buildSendMessageToChatRequest({
        zoid: <number>this.selectedChat?.zoid,
        content: message,
        reference: '',
        type: MessageType.MESSAGE,
      })
      .pipe(
        switchMap((request) => this.dispatchService.dispatch(request)),
        tap(() =>
          this.refreshChatMessagesView$.next(this.selectedChat?.zoid as number)
        ),
        take(1)
      )
      .subscribe();
  }

  editMessage(message: ChatMessage) {
    this.msgRequestBuilderService
      .buildEditMessageRequest({
        zoid: <number>this.selectedChat?.zoid,
        zrid: message.zrid,
        content: message.content,
        reference: '',
        type: MessageType.MESSAGE,
      })
      .pipe(
        switchMap((request) => this.dispatchService.dispatch(request)),
        tap(() =>
          this.refreshChatMessagesView$.next(this.selectedChat?.zoid as number)
        ),
        take(1)
      )
      .subscribe();
  }

  deleteMessage(message: ChatMessage) {
    this.msgRequestBuilderService
      .buildDeleteMessageToChatRequest({
        zoid: <number>this.selectedChat?.zoid,
        zrid: message.zrid,
      })
      .pipe(
        switchMap((request) => this.dispatchService.dispatch(request)),
        tap(() =>
          this.refreshChatMessagesView$.next(this.selectedChat?.zoid as number)
        ),
        take(1)
      )
      .subscribe();
  }
}
