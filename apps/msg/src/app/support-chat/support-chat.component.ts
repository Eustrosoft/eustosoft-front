/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
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
  shareReplay,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CreateChatDialogComponent } from './components/create-chat-dialog/create-chat-dialog.component';
import { CreateChatDialogData } from './components/create-chat-dialog/create-chat-dialog-data.interface';
import { CreateChatDialogReturnData } from './components/create-chat-dialog/create-chat-dialog-return-data.interface';
import { DispatchService, QtisRequestResponse } from '@eustrosoft-front/core';
import { MsgRequestBuilderService } from './services/msg-request-builder.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  BreakpointsService,
  Option,
  PreloaderComponent,
  PromptDialogComponent,
  PromptDialogData,
} from '@eustrosoft-front/common-ui';
import { RenameChatDialogComponent } from './components/rename-chat-dialog/rename-chat-dialog.component';
import { RenameChatDialogData } from './components/rename-chat-dialog/rename-chat-dialog-data.interface';
import { RenameChatDialogReturnData } from './components/rename-chat-dialog/rename-chat-dialog-return-data.interface';
import { MsgDictionaryService } from './services/msg-dictionary.service';
import { MsgSubjectsService } from './services/msg-subjects.service';
import { MsgSubjects } from './contants/enums/msg-subjects.enum';
import { MsgMapperService } from './services/msg-mapper.service';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatViewComponent } from './components/chat-view/chat-view.component';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
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
  EditChatMessageRequest,
  EditChatMessageResponse,
  MessageType,
  MsgChatStatus,
  SendChatMessageRequest,
  SendChatMessageResponse,
  UpdateChatListRequest,
  UpdateChatListResponse,
  ViewChatsRequest,
  ViewChatsResponse,
} from '@eustrosoft-front/msg-lib';
import { DicValue } from '@eustrosoft-front/dic';

@Component({
  selector: 'eustrosoft-front-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss'],
  providers: [MsgSubjectsService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatSidenavModule,
    NgTemplateOutlet,
    NgIf,
    MatButtonModule,
    PreloaderComponent,
    ChatViewComponent,
    ChatListComponent,
    AsyncPipe,
    TranslateModule,
  ],
})
export class SupportChatComponent implements OnInit, OnDestroy {
  private readonly dispatchService = inject(DispatchService);
  private readonly msgRequestBuilderService = inject(MsgRequestBuilderService);
  private readonly msgDictionaryService = inject(MsgDictionaryService);
  private readonly msgSubjectsService = inject(MsgSubjectsService);
  private readonly msgMapperService = inject(MsgMapperService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translateService = inject(TranslateService);
  private readonly breakpointsService = inject(BreakpointsService);

  fetchChatsByStatuses$ = new BehaviorSubject<MsgChatStatus[]>([]);
  fetchChatMessagesByChatId$ = new BehaviorSubject<number | undefined>(
    undefined,
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
            switchMap((req: QtisRequestResponse<ViewChatsRequest>) =>
              this.dispatchService.dispatch<
                ViewChatsRequest,
                ViewChatsResponse
              >(req),
            ),
            map((response: QtisRequestResponse<ViewChatsResponse>) =>
              response.r.flatMap((r: ViewChatsResponse) => r.chats),
            ),
            switchMap((chats: Chat[]) =>
              of({ isLoading: false, isError: false, chats }).pipe(delay(200)),
            ),
          ),
      ),
      startWith({ isLoading: true, isError: false, chats: undefined }),
    ),
    this.fetchChatMessagesByChatId$.asObservable().pipe(
      switchMap(() =>
        this.chatListRefreshInterval$.pipe(
          switchMap(() =>
            this.msgRequestBuilderService.buildUpdateChatListRequest({
              statuses: this.fetchChatsByStatuses$.getValue(),
            }),
          ),
          switchMap((req: QtisRequestResponse<UpdateChatListRequest>) =>
            this.dispatchService.dispatch<
              UpdateChatListRequest,
              UpdateChatListResponse
            >(req),
          ),
          map((response: QtisRequestResponse<UpdateChatListResponse>) =>
            response.r.flatMap((r: UpdateChatListResponse) => r.chats),
          ),
        ),
      ),
    ),
  ]).pipe(
    switchMap(([objectForView, chatUpdates]) => {
      if (!objectForView.chats) {
        return of(structuredClone(objectForView));
      }
      const chatUpdatesMap = new Map(
        chatUpdates.map((item) => [item.zoid, item.zver]),
      );
      const chatIdsWithChangedZver = objectForView.chats
        .filter((item) => {
          const arrayItem = chatUpdatesMap.get(item.zoid);
          return arrayItem !== undefined && arrayItem !== item.zver;
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
    }),
    shareReplay(1),
  );

  chatMessages$: Observable<{
    messages: ChatMessage[] | undefined;
    isLoading: boolean;
    isError: boolean;
  }> = this.fetchChatMessagesByChatId$.asObservable().pipe(
    filter((zoid): zoid is number => typeof zoid !== 'undefined'),
    startWith(1),
    pairwise(),
    switchMap(([first, second]) =>
      iif(
        // If selected chat zoid is changed - fetchWithPreloader, if not - fetchWithoutPreloader
        () => first === second,
        this.msgMapperService.fetchChatMessagesWithoutPreloader(second),
        this.msgMapperService.fetchChatMessagesWithPreloader(second),
      ),
    ),
  );

  // TODO Get dictionary values only once on app init
  chatFilterOptions$: Observable<DicValue[]> = this.msgDictionaryService
    .getStatusOptions()
    .pipe(
      catchError((_err: HttpErrorResponse) => {
        this.snackBar.open(
          this.translateService.instant(
            'MSG.ERRORS.CHAT_STATUS_FILTERS_FETCH_ERROR',
          ),
          'close',
        );
        return EMPTY;
      }),
    );

  securityLevelOptions$: Observable<Option[]> = this.msgDictionaryService
    .getSecurityLevelOptions()
    .pipe(
      catchError((_err: HttpErrorResponse) => {
        this.snackBar.open(
          this.translateService.instant(
            'MSG.ERRORS.CHAT_SECURITY_LEVEL_OPTIONS_FETCH_ERROR',
          ),
          'close',
        );
        return EMPTY;
      }),
    );

  scopeOptions$: Observable<Option[]> = this.msgDictionaryService
    .getScopeOptions()
    .pipe(
      catchError((_err: HttpErrorResponse) => {
        this.snackBar.open(
          this.translateService.instant(
            'MSG.ERRORS.CHAT_SECURITY_LEVEL_OPTIONS_FETCH_ERROR',
          ),
          'close',
        );
        return EMPTY;
      }),
    );

  userSeenChatVersions$!: Observable<ChatVersion[]>;

  selectedChat: Chat | undefined = undefined;
  selectedStatuses: MsgChatStatus[] = [];
  isCollapsed = true;
  protected isSm = this.breakpointsService.isSm();

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    this.setUpSidebar();
  }

  ngOnInit(): void {
    this.setUpSidebar();
    this.msgSubjectsService.createSubject(
      MsgSubjects.MESSAGE_SUCCESSFULLY_SENT,
    );
  }

  ngOnDestroy(): void {
    this.msgSubjectsService.completeAll();
  }

  setUpSidebar(): void {
    if (this.breakpointsService.isSm()) {
      this.isCollapsed = true;
      this.isSm = true;
    } else {
      this.isCollapsed = false;
      this.isSm = false;
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  chatSelected(chat: Chat): void {
    this.selectedChat = chat;
    this.selectedChat.hasUpdates = false;
    this.fetchChatMessagesByChatId$.next(chat.zoid);
    if (this.isSm) {
      this.toggleSidebar();
    }
  }

  refreshChats(): void {
    this.fetchChatsByStatuses$.next(this.selectedStatuses);
  }

  createNewChat(): void {
    const dialogRef = this.dialog.open<
      CreateChatDialogComponent,
      CreateChatDialogData,
      CreateChatDialogReturnData
    >(CreateChatDialogComponent, {
      data: {
        securityLevelOptions$: this.securityLevelOptions$,
        scopeOptions$: this.scopeOptions$,
      },
      width: this.isSm ? '100vw' : '50vw',
    });

    const dialogClosed$ = dialogRef.afterClosed();

    dialogRef.componentInstance.formSubmitted
      .pipe(
        filter(
          (data): data is CreateChatDialogReturnData =>
            typeof data !== 'undefined',
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
              }),
            ),
        ),
        tap(() => {
          this.fetchChatsByStatuses$.next(this.selectedStatuses);
          dialogRef.close();
        }),
        takeUntil(dialogClosed$),
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
          >(request),
        ),
        tap(() => {
          this.fetchChatMessagesByChatId$.next(
            this.selectedChat?.zoid as number,
          );
          this.msgSubjectsService.performNext(
            MsgSubjects.MESSAGE_SUCCESSFULLY_SENT,
          );
        }),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, 'close');
          return EMPTY;
        }),
        take(1),
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
          >(request),
        ),
        tap(() =>
          this.fetchChatMessagesByChatId$.next(
            this.selectedChat?.zoid as number,
          ),
        ),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, 'close');
          return EMPTY;
        }),
        take(1),
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
          >(request),
        ),
        tap(() =>
          this.fetchChatMessagesByChatId$.next(
            this.selectedChat?.zoid as number,
          ),
        ),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, 'close');
          return EMPTY;
        }),
        take(1),
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
          >(request),
        ),
        map(
          (response: QtisRequestResponse<ChangeChatStatusResponse>) =>
            response.r[0].e,
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
        take(1),
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
          >(request),
        ),
        map(
          (response: QtisRequestResponse<ChangeChatStatusResponse>) =>
            response.r[0].e,
        ),
        tap((hasError) => {
          this.fetchChatsByStatuses$.next(this.selectedStatuses);
          if (!hasError) {
            this.chatSelected({ ...chat, status: MsgChatStatus.WIP });
          }
        }),
        take(1),
      )
      .subscribe();
  }

  renameChat(chat: Chat): void {
    const dialogRef = this.dialog.open<
      RenameChatDialogComponent,
      RenameChatDialogData,
      RenameChatDialogReturnData
    >(RenameChatDialogComponent, {
      data: {
        currentChatSubject: chat.subject,
      },
      width: this.isSm ? '100vw' : '50vw',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter(
          (data): data is RenameChatDialogReturnData =>
            typeof data !== 'undefined',
        ),
        switchMap((data) =>
          this.msgRequestBuilderService.buildChangeChatStatusRequest({
            zoid: chat.zoid,
            zrid: chat.zrid,
            subject: data.subject,
            reference: null,
            status: chat.status,
          }),
        ),
        switchMap((req) =>
          this.dispatchService.dispatch<
            ChangeChatStatusRequest,
            ChangeChatStatusResponse
          >(req),
        ),
        tap(() => this.fetchChatsByStatuses$.next(this.selectedStatuses)),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, 'close');
          return EMPTY;
        }),
        take(1),
      )
      .subscribe();
  }

  deleteChat(chat: Chat): void {
    const dialogRef = this.dialog.open<
      PromptDialogComponent,
      PromptDialogData,
      boolean
    >(PromptDialogComponent, {
      data: {
        title: this.translateService.instant('MSG.DELETE_CHAT_MODAL.TITLE'),
        text: this.translateService.instant('MSG.DELETE_CHAT_MODAL.TEXT', {
          subject: chat.subject,
        }),
        cancelButtonText: this.translateService.instant(
          'MSG.DELETE_CHAT_MODAL.CANCEL_BUTTON_TEXT',
        ),
        submitButtonText: this.translateService.instant(
          'MSG.DELETE_CHAT_MODAL.SUBMIT_BUTTON_TEXT',
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
          }),
        ),
        switchMap((req) =>
          this.dispatchService.dispatch<DeleteChatRequest, DeleteChatResponse>(
            req,
          ),
        ),
        tap(() => this.fetchChatsByStatuses$.next(this.selectedStatuses)),
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(`${err.error}`, 'close');
          return EMPTY;
        }),
        take(1),
      )
      .subscribe();
  }

  statusFilterChanged(statuses: MsgChatStatus[]): void {
    this.selectedStatuses = statuses;
    this.selectedChat = undefined;
    this.fetchChatsByStatuses$.next(statuses);
  }
}
