/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  delay,
  filter,
  ignoreElements,
  iif,
  interval,
  map,
  Observable,
  of,
  pairwise,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CreateChatDialogComponent } from './components/create-chat-dialog/create-chat-dialog.component';
import { CreateChatDialogDataInterface } from './components/create-chat-dialog/create-chat-dialog-data.interface';
import { CreateChatDialogReturnDataInterface } from './components/create-chat-dialog/create-chat-dialog-return-data.interface';
import {
  ChangeChatStatusRequest,
  ChangeChatStatusResponse,
  Chat,
  ChatMessage,
  CreateChatRequest,
  CreateChatResponse,
  MessageType,
  MsgChatStatus,
  QtisRequestResponseInterface,
  ViewChatRequest,
  ViewChatResponse,
  ViewChatsRequest,
  ViewChatsResponse,
} from '@eustrosoft-front/core';
import { MsgRequestBuilderService } from './services/msg-request-builder.service';
import { DispatchService, SamService } from '@eustrosoft-front/security';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

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
  private snackBar = inject(MatSnackBar);
  private translateService = inject(TranslateService);
  private cd = inject(ChangeDetectorRef);

  fetchChats$ = new BehaviorSubject(true);
  fetchChatMessagesByChatId$ = new BehaviorSubject<number | undefined>(
    undefined
  );
  chatMessagesRefreshInterval$ = interval(5000).pipe(startWith(1));

  chats$ = combineLatest([this.fetchChats$]).pipe(
    switchMap(() => this.msgRequestBuilderService.buildViewChatsRequest()),
    switchMap((req: QtisRequestResponseInterface<ViewChatsRequest>) =>
      this.dispatchService.dispatch<ViewChatsRequest, ViewChatsResponse>(req)
    ),
    map((response: QtisRequestResponseInterface<ViewChatsResponse>) =>
      response.r.flatMap((r: ViewChatsResponse) => r.chats)
    ),
    shareReplay(1)
  );

  chatsError$ = this.chats$.pipe(
    ignoreElements(),
    catchError((err: HttpErrorResponse) => of(err))
  );

  chatMessages$: Observable<{
    messages: ChatMessage[] | undefined;
    isLoading: boolean;
  }> = combineLatest([
    this.fetchChatMessagesByChatId$.pipe(
      filter((zoid): zoid is number => typeof zoid !== 'undefined')
    ),
    this.chatMessagesRefreshInterval$,
  ]).pipe(
    startWith([1, 1]),
    pairwise(),
    switchMap(([first, second]) =>
      iif(
        // If selected chat zoid is changed - fetchWithPreloader, if interval tick happened - fetchWithoutPreloader
        () => first[1] !== second[1] || first[0] === second[0],
        this.fetchWithoutPreloader(second[0]),
        this.fetchWithPreloader(second[0])
      )
    ),
    shareReplay(1)
  );

  chatMessagesError$ = this.chatMessages$.pipe(
    ignoreElements(),
    catchError((err: HttpErrorResponse) => of(err))
  );

  selectedChat: Chat | undefined = undefined;
  isCollapsed = true;
  isXs = false;

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.setUpSidebar();
  }

  ngOnInit(): void {
    this.setUpSidebar();
  }

  fetchWithPreloader(
    zoid: number
  ): Observable<{ isLoading: boolean; messages: ChatMessage[] | undefined }> {
    return this.msgRequestBuilderService.buildViewChatRequest(zoid).pipe(
      switchMap((req: QtisRequestResponseInterface<ViewChatRequest>) =>
        this.dispatchService.dispatch<ViewChatRequest, ViewChatResponse>(req)
      ),
      map((response: QtisRequestResponseInterface<ViewChatResponse>) =>
        response.r.flatMap((r: ViewChatResponse) => r.messages)
      ),
      switchMap((messages: ChatMessage[]) =>
        of({ isLoading: false, messages }).pipe(delay(200))
      ),
      startWith({ isLoading: true, messages: undefined })
    );
  }

  fetchWithoutPreloader(
    zoid: number
  ): Observable<{ isLoading: boolean; messages: ChatMessage[] | undefined }> {
    return this.msgRequestBuilderService.buildViewChatRequest(zoid).pipe(
      switchMap((req: QtisRequestResponseInterface<ViewChatRequest>) =>
        this.dispatchService.dispatch<ViewChatRequest, ViewChatResponse>(req)
      ),
      map((response: QtisRequestResponseInterface<ViewChatResponse>) =>
        response.r.flatMap((r: ViewChatResponse) => r.messages)
      ),
      switchMap((messages: ChatMessage[]) => of({ isLoading: false, messages }))
    );
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
    this.fetchChatMessagesByChatId$.next(chat.zoid);
  }

  createNewChat() {
    const dialogRef = this.dialog.open<
      CreateChatDialogComponent,
      CreateChatDialogDataInterface,
      CreateChatDialogReturnDataInterface
    >(CreateChatDialogComponent, {
      data: {
        title: this.translateService.instant(
          'MSG.CREATE_CHAT_MODAL.TITLE_TEXT'
        ),
        subjectInputLabel: this.translateService.instant(
          'MSG.CREATE_CHAT_MODAL.SUBJECT_LABEL_TEXT'
        ),
        messageInputLabel: this.translateService.instant(
          'MSG.CREATE_CHAT_MODAL.MESSAGE_LABEL_TEXT'
        ),
        cancelButtonText: this.translateService.instant(
          'MSG.CREATE_CHAT_MODAL.CANCEL_BUTTON_TEXT'
        ),
        submitButtonText: this.translateService.instant(
          'MSG.CREATE_CHAT_MODAL.SUBMIT_BUTTON_TEXT'
        ),
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
          ])
        ),
        switchMap(([content, slvl]) =>
          this.msgRequestBuilderService.buildCreateChatRequest({
            subject: content.subject,
            content: content.message,
            slvl: +slvl,
          })
        ),
        switchMap((req) =>
          this.dispatchService.dispatch<CreateChatRequest, CreateChatResponse>(
            req
          )
        ),
        tap(() => this.fetchChats$.next(true)),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, 'Close');
          return of(false);
        }),
        take(1)
      )
      .subscribe();
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
          this.fetchChatMessagesByChatId$.next(
            this.selectedChat?.zoid as number
          )
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
          this.fetchChatMessagesByChatId$.next(
            this.selectedChat?.zoid as number
          )
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
          this.fetchChatMessagesByChatId$.next(
            this.selectedChat?.zoid as number
          )
        ),
        take(1)
      )
      .subscribe();
  }

  closeChat(chat: Chat) {
    this.msgRequestBuilderService
      .buildChangeChatStatusRequest({
        zoid: chat.zoid,
        zrid: chat.zrid,
        content: chat.subject,
        reference: null,
        status: MsgChatStatus.CLOSED,
      })
      .pipe(
        switchMap((request) =>
          this.dispatchService.dispatch<
            ChangeChatStatusRequest,
            ChangeChatStatusResponse
          >(request)
        ),
        map(
          (response: QtisRequestResponseInterface<ChangeChatStatusResponse>) =>
            response.r[0].e
        ),
        tap((hasError) => {
          this.fetchChats$.next(true);
          if (!hasError) {
            this.chatSelected({ ...chat, status: MsgChatStatus.CLOSED });
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
