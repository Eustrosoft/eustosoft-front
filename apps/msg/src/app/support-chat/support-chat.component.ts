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
  catchError,
  combineLatest,
  delay,
  EMPTY,
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
  takeUntil,
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
  DeleteChatMessageRequest,
  DeleteChatMessageResponse,
  DeleteChatRequest,
  DeleteChatResponse,
  EditChatMessageRequest,
  EditChatMessageResponse,
  MessageType,
  MsgChatStatus,
  QtisRequestResponseInterface,
  SendChatMessageRequest,
  SendChatMessageResponse,
  ViewChatRequest,
  ViewChatResponse,
  ViewChatsRequest,
  ViewChatsResponse,
  XS_SCREEN_RESOLUTION,
} from '@eustrosoft-front/core';
import { MsgRequestBuilderService } from './services/msg-request-builder.service';
import { DispatchService } from '@eustrosoft-front/security';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import {
  PromptDialogComponent,
  PromptDialogDataInterface,
} from '@eustrosoft-front/common-ui';
import { RenameChatDialogComponent } from './components/rename-chat-dialog/rename-chat-dialog.component';
import { RenameChatDialogDataInterface } from './components/rename-chat-dialog/rename-chat-dialog-data.interface';
import { RenameChatDialogReturnDataInterface } from './components/rename-chat-dialog/rename-chat-dialog-return-data.interface';
import { MsgDictionaryService } from './services/msg-dictionary.service';

@Component({
  selector: 'eustrosoft-front-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportChatComponent implements OnInit {
  private dispatchService = inject(DispatchService);
  private msgRequestBuilderService = inject(MsgRequestBuilderService);
  private msgDictionaryService = inject(MsgDictionaryService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private translateService = inject(TranslateService);
  private xsScreenRes = inject(XS_SCREEN_RESOLUTION);

  fetchChats$ = new BehaviorSubject<MsgChatStatus[]>([]);
  fetchChatMessagesByChatId$ = new BehaviorSubject<number | undefined>(
    undefined
  );
  chatMessagesRefreshInterval$ = interval(5000).pipe(startWith(1));

  chats$: Observable<{
    chats: Chat[] | undefined;
    isLoading: boolean;
  }> = this.fetchChats$.asObservable().pipe(
    switchMap((statuses) =>
      this.msgRequestBuilderService
        .buildViewChatsRequest({
          statuses,
        })
        .pipe(
          switchMap((req: QtisRequestResponseInterface<ViewChatsRequest>) =>
            this.dispatchService.dispatch<ViewChatsRequest, ViewChatsResponse>(
              req
            )
          ),
          map((response: QtisRequestResponseInterface<ViewChatsResponse>) =>
            response.r.flatMap((r: ViewChatsResponse) => r.chats)
          ),
          switchMap((chats: Chat[]) =>
            of({ isLoading: false, chats }).pipe(delay(200))
          )
        )
    ),
    startWith({ isLoading: true, chats: undefined }),
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

  // TODO Запрашивать справочные значения один раз при инициализации приложения
  chatFilterOptions$ = this.msgDictionaryService.getStatusOptions().pipe(
    catchError((err: HttpErrorResponse) => {
      this.snackBar.open(
        this.translateService.instant(
          'MSG.ERRORS.CHAT_STATUS_FILTERS_FETCH_ERROR'
        ),
        '🞩'
      );
      return EMPTY;
    })
  );

  securityLevelOptions$ = this.msgDictionaryService
    .getSecurityLevelOptions()
    .pipe(
      catchError((err: HttpErrorResponse) => {
        this.snackBar.open(
          this.translateService.instant(
            'MSG.ERRORS.CHAT_SECURITY_LEVEL_OPTIONS_FETCH_ERROR'
          ),
          '🞩'
        );
        return EMPTY;
      })
    );

  selectedChat: Chat | undefined = undefined;
  selectedStatuses: MsgChatStatus[] = [];
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

  setUpSidebar(): void {
    if (window.innerWidth <= this.xsScreenRes) {
      this.isCollapsed = true;
      this.isXs = true;
    } else {
      this.isCollapsed = false;
      this.isXs = false;
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  chatSelected(chat: Chat): void {
    this.selectedChat = chat;
    this.fetchChatMessagesByChatId$.next(chat.zoid);
    if (this.isXs) {
      this.toggleSidebar();
    }
  }

  refreshChats(): void {
    this.fetchChats$.next(this.selectedStatuses);
  }

  createNewChat(): void {
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
        securityLevelOptions$: this.securityLevelOptions$,
      },
      minHeight: '25vh',
      minWidth: '40vw',
    });

    const dialogClosed$ = dialogRef.afterClosed();

    dialogRef.componentInstance.formSubmitted
      .pipe(
        filter(
          (data): data is CreateChatDialogReturnDataInterface =>
            typeof data !== 'undefined'
        ),
        switchMap((content) => {
          const params: CreateChatRequest['params'] = {
            subject: content.subject,
            content: content.message,
          };
          if (content.securityLevel !== undefined) {
            params.slvl = +content.securityLevel;
          }
          return this.msgRequestBuilderService.buildCreateChatRequest(params);
        }),
        switchMap((req) =>
          this.dispatchService
            .dispatch<CreateChatRequest, CreateChatResponse>(req)
            .pipe(
              catchError((err: HttpErrorResponse) => {
                this.snackBar.open(`${err.error}`, '🞩');
                dialogRef.componentInstance.form.enable();
                return EMPTY;
              })
            )
        ),
        tap(() => {
          this.fetchChats$.next(this.selectedStatuses);
          dialogRef.close();
        }),
        takeUntil(dialogClosed$)
      )
      .subscribe();
  }

  /**
   * TODO
   * Переделать функционал отправки сообщения.
   * При нажатии на кнопку отправки - поле ввода сообщения не очищается сразу.
   * Наверное надо создать subject в каком-то сервисе, который будет указывать на признак того,
   * что сообщение было успешно отправлено.
   * Если сообщение было успешно отправлено - то поле очищается от данных, иначе,
   * поле сохраняет значение введенное пользователем
   * @param message
   */
  sendMessage(message: string): void {
    this.msgRequestBuilderService
      .buildSendMessageToChatRequest({
        zoid: <number>this.selectedChat?.zoid,
        content: message,
        reference: '',
        type: MessageType.MESSAGE,
      })
      .pipe(
        switchMap((request) =>
          this.dispatchService.dispatch<
            SendChatMessageRequest,
            SendChatMessageResponse
          >(request)
        ),
        tap(() =>
          this.fetchChatMessagesByChatId$.next(
            this.selectedChat?.zoid as number
          )
        ),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, '🞩');
          return EMPTY;
        }),
        take(1)
      )
      .subscribe();
  }

  editMessage(message: ChatMessage): void {
    this.msgRequestBuilderService
      .buildEditMessageRequest({
        zoid: <number>this.selectedChat?.zoid,
        zrid: message.zrid,
        content: message.content,
        reference: '',
        type: MessageType.MESSAGE,
      })
      .pipe(
        switchMap((request) =>
          this.dispatchService.dispatch<
            EditChatMessageRequest,
            EditChatMessageResponse
          >(request)
        ),
        tap(() =>
          this.fetchChatMessagesByChatId$.next(
            this.selectedChat?.zoid as number
          )
        ),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, '🞩');
          return EMPTY;
        }),
        take(1)
      )
      .subscribe();
  }

  deleteMessage(message: ChatMessage): void {
    this.msgRequestBuilderService
      .buildDeleteChatMessageRequest({
        zoid: <number>this.selectedChat?.zoid,
        zrid: message.zrid,
      })
      .pipe(
        switchMap((request) =>
          this.dispatchService.dispatch<
            DeleteChatMessageRequest,
            DeleteChatMessageResponse
          >(request)
        ),
        tap(() =>
          this.fetchChatMessagesByChatId$.next(
            this.selectedChat?.zoid as number
          )
        ),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, '🞩');
          return EMPTY;
        }),
        take(1)
      )
      .subscribe();
  }

  closeChat(chat: Chat): void {
    this.msgRequestBuilderService
      .buildChangeChatStatusRequest({
        zoid: chat.zoid,
        zrid: chat.zrid,
        subject: chat.subject,
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
          this.fetchChats$.next(this.selectedStatuses);
          if (!hasError) {
            this.chatSelected({ ...chat, status: MsgChatStatus.CLOSED });
          }
        }),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, '🞩');
          return EMPTY;
        }),
        take(1)
      )
      .subscribe();
  }

  reopenChat(chat: Chat): void {
    this.msgRequestBuilderService
      .buildChangeChatStatusRequest({
        zoid: chat.zoid,
        zrid: chat.zrid,
        subject: chat.subject,
        reference: null,
        status: MsgChatStatus.WIP,
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
          this.fetchChats$.next(this.selectedStatuses);
          if (!hasError) {
            this.chatSelected({ ...chat, status: MsgChatStatus.WIP });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  renameChat(chat: Chat) {
    const dialogRef = this.dialog.open<
      RenameChatDialogComponent,
      RenameChatDialogDataInterface,
      RenameChatDialogReturnDataInterface
    >(RenameChatDialogComponent, {
      data: {
        title: this.translateService.instant(
          'MSG.RENAME_CHAT_MODAL.TITLE_TEXT'
        ),
        subjectInputLabel: this.translateService.instant(
          'MSG.RENAME_CHAT_MODAL.SUBJECT_LABEL_TEXT'
        ),
        currentChatSubject: chat.subject,
        cancelButtonText: this.translateService.instant(
          'MSG.RENAME_CHAT_MODAL.CANCEL_BUTTON_TEXT'
        ),
        submitButtonText: this.translateService.instant(
          'MSG.RENAME_CHAT_MODAL.SUBMIT_BUTTON_TEXT'
        ),
      },
      minHeight: '20vh',
      minWidth: '40vw',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter(
          (data): data is RenameChatDialogReturnDataInterface =>
            typeof data !== 'undefined'
        ),
        switchMap((data) =>
          this.msgRequestBuilderService.buildChangeChatStatusRequest({
            zoid: chat.zoid,
            zrid: chat.zrid,
            subject: data.subject,
            reference: null,
            status: chat.status,
          })
        ),
        switchMap((req) =>
          this.dispatchService.dispatch<
            ChangeChatStatusRequest,
            ChangeChatStatusResponse
          >(req)
        ),
        tap(() => this.fetchChats$.next(this.selectedStatuses)),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, '🞩');
          return EMPTY;
        }),
        take(1)
      )
      .subscribe();
  }

  deleteChat(chat: Chat) {
    const dialogRef = this.dialog.open<
      PromptDialogComponent,
      PromptDialogDataInterface,
      boolean
    >(PromptDialogComponent, {
      data: {
        title: this.translateService.instant('MSG.DELETE_CHAT_MODAL.TITLE'),
        text: this.translateService.instant('MSG.DELETE_CHAT_MODAL.TEXT', {
          subject: chat.subject,
        }),
        cancelButtonText: this.translateService.instant(
          'MSG.DELETE_CHAT_MODAL.CANCEL_BUTTON_TEXT'
        ),
        submitButtonText: this.translateService.instant(
          'MSG.DELETE_CHAT_MODAL.SUBMIT_BUTTON_TEXT'
        ),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((v) => Boolean(v)),
        switchMap(() =>
          this.msgRequestBuilderService.buildDeleteChatRequest({
            zoid: chat.zoid,
            zver: chat.zver,
          })
        ),
        switchMap((req) =>
          this.dispatchService.dispatch<DeleteChatRequest, DeleteChatResponse>(
            req
          )
        ),
        tap(() => this.fetchChats$.next(this.selectedStatuses)),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, '🞩');
          return EMPTY;
        }),
        take(1)
      )
      .subscribe();
  }

  statusFilterChanged(statuses: MsgChatStatus[]) {
    this.selectedStatuses = statuses;
    this.selectedChat = undefined;
    this.fetchChats$.next(statuses);
  }
}
