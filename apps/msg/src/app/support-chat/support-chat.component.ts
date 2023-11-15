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
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  delay,
  EMPTY,
  filter,
  iif,
  interval,
  map,
  Observable,
  of,
  pairwise,
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
  ChatVersion,
  CreateChatRequest,
  CreateChatResponse,
  DeleteChatMessageRequest,
  DeleteChatMessageResponse,
  DeleteChatRequest,
  DeleteChatResponse,
  DicValue,
  EditChatMessageRequest,
  EditChatMessageResponse,
  MessageType,
  MsgChatStatus,
  QtisRequestResponseInterface,
  SendChatMessageRequest,
  SendChatMessageResponse,
  UpdateChatListRequest,
  UpdateChatListResponse,
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
  Option,
  PromptDialogComponent,
  PromptDialogDataInterface,
} from '@eustrosoft-front/common-ui';
import { RenameChatDialogComponent } from './components/rename-chat-dialog/rename-chat-dialog.component';
import { RenameChatDialogDataInterface } from './components/rename-chat-dialog/rename-chat-dialog-data.interface';
import { RenameChatDialogReturnDataInterface } from './components/rename-chat-dialog/rename-chat-dialog-return-data.interface';
import { MsgDictionaryService } from './services/msg-dictionary.service';
import { MsgSubjectsService } from './services/msg-subjects.service';
import { MsgSubjects } from './contants/enums/msg-subjects.enum';
import { MsgMapperService } from './services/msg-mapper.service';

@Component({
  selector: 'eustrosoft-front-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss'],
  providers: [MsgSubjectsService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportChatComponent implements OnInit, OnDestroy {
  private dispatchService = inject(DispatchService);
  private msgRequestBuilderService = inject(MsgRequestBuilderService);
  private msgDictionaryService = inject(MsgDictionaryService);
  private msgSubjectsService = inject(MsgSubjectsService);
  private msgMapperService = inject(MsgMapperService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private translateService = inject(TranslateService);
  private xsScreenRes = inject(XS_SCREEN_RESOLUTION);

  fetchChatsByStatuses$ = new BehaviorSubject<MsgChatStatus[]>([]);
  fetchChatMessagesByChatId$ = new BehaviorSubject<number | undefined>(
    undefined
  );
  chatListRefreshInterval$ = interval(5000).pipe(startWith(1));

  chats$: Observable<{
    chats: Chat[] | undefined;
    isLoading: boolean;
    isError: boolean;
  }> = combineLatest([
    this.fetchChatsByStatuses$.asObservable().pipe(
      switchMap((statuses) =>
        this.msgRequestBuilderService
          .buildViewChatsRequest({
            statuses,
          })
          .pipe(
            switchMap((req: QtisRequestResponseInterface<ViewChatsRequest>) =>
              this.dispatchService.dispatch<
                ViewChatsRequest,
                ViewChatsResponse
              >(req)
            ),
            map((response: QtisRequestResponseInterface<ViewChatsResponse>) =>
              response.r.flatMap((r: ViewChatsResponse) => r.chats)
            ),
            switchMap((chats: Chat[]) =>
              of({ isLoading: false, isError: false, chats }).pipe(delay(200))
            )
          )
      ),
      startWith({ isLoading: true, isError: false, chats: undefined })
    ),
    this.fetchChatMessagesByChatId$.asObservable().pipe(
      switchMap(() =>
        this.chatListRefreshInterval$.pipe(
          switchMap(() =>
            this.msgRequestBuilderService.buildUpdateChatListRequest({
              statuses: this.fetchChatsByStatuses$.getValue(),
            })
          ),
          switchMap(
            (req: QtisRequestResponseInterface<UpdateChatListRequest>) =>
              this.dispatchService.dispatch<
                UpdateChatListRequest,
                UpdateChatListResponse
              >(req)
          ),
          map(
            (response: QtisRequestResponseInterface<UpdateChatListResponse>) =>
              response.r.flatMap((r: UpdateChatListResponse) => r.chats)
          )
        )
      )
    ),
  ]).pipe(
    switchMap(([objectForView, chatUpdates]) => {
      if (!objectForView.chats) {
        return of(structuredClone(objectForView));
      }
      const chatUpdatesMap = new Map(
        chatUpdates.map((item) => [item.zoid, item.zver])
      );
      const chatIdsWithChangedZver = objectForView.chats
        .filter((item) => {
          const arrayItem = chatUpdatesMap.get(item.zoid);
          return arrayItem && arrayItem !== item.zver;
        })
        .map((item) => item.zoid);
      // set hasUpdates prop if chat version had changed
      objectForView.chats.forEach((item) => {
        if (chatIdsWithChangedZver.includes(item.zoid)) {
          item.hasUpdates = true;
        }
        if (this.selectedChat && this.selectedChat.zoid === item.zoid) {
          item.zver = chatUpdatesMap.get(item.zoid) as number;
          item.hasUpdates = false;
        }
      });
      // if selected chat contains has new version -> fetch messages
      if (
        this.selectedChat &&
        chatIdsWithChangedZver.includes(this.selectedChat.zoid)
      ) {
        this.fetchChatMessagesByChatId$.next(this.selectedChat.zoid);
      }
      return of(structuredClone(objectForView));
    })
  );

  chatMessages$: Observable<{
    messages: ChatMessage[] | undefined;
    isLoading: boolean;
    isError: boolean;
  }> = combineLatest([
    this.fetchChatMessagesByChatId$.pipe(
      filter((zoid): zoid is number => typeof zoid !== 'undefined')
    ),
  ]).pipe(
    startWith([1, 1]),
    pairwise(),
    switchMap(([first, second]) =>
      iif(
        // If selected chat zoid is changed - fetchWithPreloader, if not - fetchWithoutPreloader
        () => first[0] === second[0],
        this.msgMapperService.fetchChatMessagesWithoutPreloader(second[0]),
        this.msgMapperService.fetchChatMessagesWithPreloader(second[0])
      )
    )
  );

  // TODO Get dictionary values only once on app init
  chatFilterOptions$: Observable<DicValue[]> = this.msgDictionaryService
    .getStatusOptions()
    .pipe(
      catchError((err: HttpErrorResponse) => {
        this.snackBar.open(
          this.translateService.instant(
            'MSG.ERRORS.CHAT_STATUS_FILTERS_FETCH_ERROR'
          ),
          'close'
        );
        return EMPTY;
      })
    );

  securityLevelOptions$: Observable<Option[]> = this.msgDictionaryService
    .getSecurityLevelOptions()
    .pipe(
      catchError((err: HttpErrorResponse) => {
        this.snackBar.open(
          this.translateService.instant(
            'MSG.ERRORS.CHAT_SECURITY_LEVEL_OPTIONS_FETCH_ERROR'
          ),
          'close'
        );
        return EMPTY;
      })
    );

  scopeOptions$: Observable<Option[]> = this.msgDictionaryService
    .getScopeOptions()
    .pipe(
      catchError((err: HttpErrorResponse) => {
        this.snackBar.open(
          this.translateService.instant(
            'MSG.ERRORS.CHAT_SECURITY_LEVEL_OPTIONS_FETCH_ERROR'
          ),
          'close'
        );
        return EMPTY;
      })
    );

  userSeenChatVersions$!: Observable<ChatVersion[]>;

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
    this.msgSubjectsService.createSubject<void>(
      MsgSubjects.MESSAGE_SUCCESSFULLY_SENT
    );
  }

  ngOnDestroy(): void {
    this.msgSubjectsService.completeAll();
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
    this.selectedChat.hasUpdates = false;
    this.fetchChatMessagesByChatId$.next(chat.zoid);
    if (this.isXs) {
      this.toggleSidebar();
    }
  }

  refreshChats(): void {
    this.fetchChatsByStatuses$.next(this.selectedStatuses);
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
        scopeOptions$: this.scopeOptions$,
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
          if (content.scope !== undefined) {
            params.zsid = content.scope;
          }
          return this.msgRequestBuilderService.buildCreateChatRequest(params);
        }),
        switchMap((req) =>
          this.dispatchService
            .dispatch<CreateChatRequest, CreateChatResponse>(req)
            .pipe(
              catchError((err: HttpErrorResponse) => {
                this.snackBar.open(`${err.error}`, 'close');
                dialogRef.componentInstance.form.enable();
                return EMPTY;
              })
            )
        ),
        tap(() => {
          this.fetchChatsByStatuses$.next(this.selectedStatuses);
          dialogRef.close();
        }),
        takeUntil(dialogClosed$)
      )
      .subscribe();
  }

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
        tap(() => {
          this.fetchChatMessagesByChatId$.next(
            this.selectedChat?.zoid as number
          );
          this.msgSubjectsService.performNext<void>(
            MsgSubjects.MESSAGE_SUCCESSFULLY_SENT,
            undefined
          );
        }),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, 'close');
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
          this.snackBar.open(`${err.error}`, 'close');
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
          this.snackBar.open(`${err.error}`, 'close');
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
          this.fetchChatsByStatuses$.next(this.selectedStatuses);
          if (!hasError) {
            this.chatSelected({ ...chat, status: MsgChatStatus.CLOSED });
          }
        }),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, 'close');
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
          this.fetchChatsByStatuses$.next(this.selectedStatuses);
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
        tap(() => this.fetchChatsByStatuses$.next(this.selectedStatuses)),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, 'close');
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
        tap(() => this.fetchChatsByStatuses$.next(this.selectedStatuses)),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, 'close');
          return EMPTY;
        }),
        take(1)
      )
      .subscribe();
  }

  statusFilterChanged(statuses: MsgChatStatus[]) {
    this.selectedStatuses = statuses;
    this.selectedChat = undefined;
    this.fetchChatsByStatuses$.next(statuses);
  }
}
