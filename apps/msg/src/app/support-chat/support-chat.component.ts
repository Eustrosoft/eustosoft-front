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
  catchError,
  combineLatest,
  EMPTY,
  filter,
  iif,
  Observable,
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
import {
  Chat,
  ChatMessage,
  ChatVersion,
  CreateChatDialogData,
  CreateChatDialogReturnData,
  MessageType,
  MsgChatStatus,
  MsgDictionaryService,
  MsgMapperService,
  MsgRequestBuilderService,
  MsgService,
  MsgSubjects,
  MsgSubjectsService,
  RenameChatDialogData,
  RenameChatDialogReturnData,
} from '@eustrosoft-front/msg-lib';
import { DispatchService } from '@eustrosoft-front/core';
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
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatViewComponent } from './components/chat-view/chat-view.component';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
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
  private readonly msgService = inject(MsgService);
  private readonly msgRequestBuilderService = inject(MsgRequestBuilderService);
  private readonly msgDictionaryService = inject(MsgDictionaryService);
  private readonly msgSubjectsService = inject(MsgSubjectsService);
  private readonly msgMapperService = inject(MsgMapperService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translateService = inject(TranslateService);
  private readonly breakpointsService = inject(BreakpointsService);

  chats$: Observable<{
    chats: Chat[] | undefined;
    isLoading: boolean;
    isError: boolean;
  }> = combineLatest([
    this.msgService.fetchChatsByStatuses$
      .asObservable()
      .pipe(switchMap((statuses) => this.msgService.getChats$(statuses))),
    this.msgService.fetchChatMessagesByChatId$
      .asObservable()
      .pipe(
        switchMap(() =>
          this.msgService.chatListRefreshInterval$.pipe(
            switchMap(() =>
              this.msgService.getChatsUpdates$(
                this.msgService.fetchChatsByStatuses$.getValue(),
              ),
            ),
          ),
        ),
      ),
  ]).pipe(
    switchMap(([objectForView, chatUpdates]) =>
      this.msgService.mapUpdates$(
        objectForView,
        chatUpdates,
        this.selectedChat,
      ),
    ),
    shareReplay(1),
  );

  chatMessages$: Observable<{
    messages: ChatMessage[] | undefined;
    isLoading: boolean;
    isError: boolean;
  }> = this.msgService.fetchChatMessagesByChatId$.asObservable().pipe(
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
            'MSG.ERRORS.CHAT_SCOPE_OPTIONS_FETCH_ERROR',
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
    this.msgService.fetchChatMessagesByChatId$.next(chat.zoid);
    if (this.isSm) {
      this.toggleSidebar();
    }
  }

  refreshChats(): void {
    this.msgService.fetchChatsByStatuses$.next(this.selectedStatuses);
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
        switchMap((content) =>
          this.msgService.createNewChat$(content).pipe(
            catchError((err: HttpErrorResponse) => {
              this.snackBar.open(`${err.error}`, 'close');
              dialogRef.componentInstance.form.enable();
              return EMPTY;
            }),
          ),
        ),
        tap(() => {
          this.msgService.fetchChatsByStatuses$.next(this.selectedStatuses);
          dialogRef.close();
        }),
        takeUntil(dialogClosed$),
      )
      .subscribe();
  }

  sendMessage(message: string): void {
    this.msgService
      .sendChatMessage$({
        zoid: this.selectedChat!.zoid,
        content: message,
        reference: '',
        type: MessageType.MESSAGE,
      })
      .pipe(
        tap(() => {
          this.msgService.fetchChatMessagesByChatId$.next(
            this.selectedChat!.zoid,
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
    this.msgService
      .editChatMessage$({
        zoid: <number>this.selectedChat?.zoid,
        zrid: message.zrid,
        content: message.content,
        reference: '',
        type: MessageType.MESSAGE,
      })
      .pipe(
        tap(() =>
          this.msgService.fetchChatMessagesByChatId$.next(
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
    this.msgService
      .deleteChatMessage$({
        zoid: this.selectedChat!.zoid,
        zrid: message.zrid,
      })
      .pipe(
        tap(() =>
          this.msgService.fetchChatMessagesByChatId$.next(
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
    this.msgService
      .closeChat$({
        zoid: chat.zoid,
        zrid: chat.zrid,
        subject: chat.subject,
        reference: null,
        status: MsgChatStatus.CLOSED,
      })
      .pipe(
        tap((hasError) => {
          this.msgService.fetchChatsByStatuses$.next(this.selectedStatuses);
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
    this.msgService
      .reopenChat$({
        zoid: chat.zoid,
        zrid: chat.zrid,
        subject: chat.subject,
        reference: null,
        status: MsgChatStatus.WIP,
      })
      .pipe(
        tap((hasError) => {
          this.msgService.fetchChatsByStatuses$.next(this.selectedStatuses);
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
          this.msgService.renameChat$({
            zoid: chat.zoid,
            zrid: chat.zrid,
            subject: data.subject,
            reference: null,
            status: chat.status,
          }),
        ),
        tap(() =>
          this.msgService.fetchChatsByStatuses$.next(this.selectedStatuses),
        ),
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
          this.msgService.deleteChat$({
            zoid: chat.zoid,
            zver: chat.zver,
          }),
        ),
        tap(() =>
          this.msgService.fetchChatsByStatuses$.next(this.selectedStatuses),
        ),
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
    this.msgService.fetchChatsByStatuses$.next(statuses);
  }
}
