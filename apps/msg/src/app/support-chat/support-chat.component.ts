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
  signal,
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
  InitialFiltersConstant,
  MessageType,
  MsgChatStatus,
  MsgDictionaryService,
  MsgMapperService,
  MsgService,
  MsgSubjects,
  MsgSubjectsService,
  RenameChatDialogData,
  RenameChatDialogReturnData,
} from '@eustrosoft-front/msg-lib';
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
import { CachedDictionaryService, DicValue } from '@eustrosoft-front/dic';

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
  private readonly msgService = inject(MsgService);
  private readonly msgDictionaryService = inject(MsgDictionaryService);
  private readonly cachedDictionaryService = inject(CachedDictionaryService);
  private readonly msgSubjectsService = inject(MsgSubjectsService);
  private readonly msgMapperService = inject(MsgMapperService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translateService = inject(TranslateService);
  private readonly breakpointsService = inject(BreakpointsService);

  protected readonly MsgChatStatus = MsgChatStatus;

  protected chats$: Observable<{
    chats: Chat[] | undefined;
    isLoading: boolean;
    isError: boolean;
  }> = combineLatest([
    this.msgService
      .getStatusFilterSubject()
      .pipe(switchMap((statuses) => this.msgService.getChats$(statuses))),
    this.msgService.fetchChatMessagesByChatId$.asObservable().pipe(
      switchMap(() =>
        this.msgService.chatListRefreshInterval$.pipe(
          switchMap(() => this.msgService.getStatusFilterSubject()),
          switchMap((statuses) => this.msgService.getChatsUpdates$(statuses)),
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

  protected chatMessages$: Observable<{
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

  protected chatFilterOptions$: Observable<DicValue[]> =
    this.msgDictionaryService.msgStatusOptions$.pipe(
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

  protected securityLevelOptions$: Observable<Option[]> =
    this.cachedDictionaryService.securityOptions$.pipe(
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

  protected scopeOptions$: Observable<Option[]> =
    this.cachedDictionaryService.scopeOptions$.pipe(
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

  protected userSeenChatVersions$!: Observable<ChatVersion[]>;

  protected selectedChat: Chat | undefined = undefined;
  protected selectedStatuses = signal<MsgChatStatus[]>(InitialFiltersConstant);
  protected isCollapsed = true;
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
    this.msgService.setStatusFilterSubject(this.selectedStatuses());
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
          this.msgService.setStatusFilterSubject(this.selectedStatuses());
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

  changeChatStatus(chat: Chat, status: MsgChatStatus): void {
    this.msgService
      .changeChatStatus$({
        zoid: chat.zoid,
        zrid: chat.zrid,
        subject: chat.subject,
        reference: null,
        status,
      })
      .pipe(
        tap((hasError) => {
          this.msgService.setStatusFilterSubject(this.selectedStatuses());
          if (!hasError) {
            this.chatSelected({ ...chat, status });
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
          this.msgService.setStatusFilterSubject(this.selectedStatuses()),
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
          this.msgService.setStatusFilterSubject(this.selectedStatuses()),
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
    this.selectedStatuses.set(statuses);
    this.selectedChat = undefined;
    this.msgService.setStatusFilterSubject(statuses);
  }
}
