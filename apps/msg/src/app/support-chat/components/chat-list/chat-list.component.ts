/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { trackByZridFunction } from '@eustrosoft-front/core';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import {
  BreakpointsService,
  HoverCursorDirective,
  HoverShadowDirective,
} from '@eustrosoft-front/common-ui';
import {
  Chat,
  ChatVersion,
  MsgChatStatus,
  MsgChatStatusPipe,
  MsgService,
} from '@eustrosoft-front/msg-lib';
import { TranslateModule } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { DicValue } from '@eustrosoft-front/dic';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'eustrosoft-front-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    NgFor,
    MatCheckboxModule,
    NgIf,
    MatListModule,
    HoverCursorDirective,
    HoverShadowDirective,
    MatDividerModule,
    TranslateModule,
    MsgChatStatusPipe,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
  ],
})
export class ChatListComponent implements OnInit {
  @Input() chats!: Chat[];
  @Input() chatVersions!: ChatVersion[];
  @Input() selectedChat: Chat | undefined = undefined;
  @Input() removeBorderRadius!: boolean;
  @Input() chatStatusFilterOptions!: DicValue[];
  @Output() chatSelected = new EventEmitter<Chat>();
  @Output() renameChatClicked = new EventEmitter<Chat>();
  @Output() deleteChatClicked = new EventEmitter<Chat>();
  @Output() collapseClicked = new EventEmitter<void>();
  @Output() newChatCreateClicked = new EventEmitter<void>();
  @Output() refreshChatsClicked = new EventEmitter<void>();
  @Output() statusFilterChanged = new EventEmitter<MsgChatStatus[]>();

  private readonly breakpointsService = inject(BreakpointsService);
  private readonly msgService = inject(MsgService);
  private readonly destroyRef = inject(DestroyRef);

  protected trackByFn = trackByZridFunction;
  protected checkedStatuses = signal<{ [key: string]: boolean }>({});
  protected isSm = this.breakpointsService.isSm();

  ngOnInit(): void {
    this.msgService
      .getStatusFilterSubject()
      .pipe(
        tap((statuses) => {
          const obj = this.chatStatusFilterOptions.reduce(
            (acc, curr) => {
              acc[curr.code] = statuses.includes(curr.code as MsgChatStatus);
              return acc;
            },
            {} as { [key: string]: boolean },
          );
          this.checkedStatuses.set(obj);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  selectChat(chat: Chat): void {
    this.selectedChat = chat;
    this.chatSelected.emit(chat);
  }

  createNewChat(): void {
    this.newChatCreateClicked.emit();
  }

  renameChat(chat: Chat): void {
    this.renameChatClicked.emit(chat);
  }

  deleteChat(chat: Chat): void {
    this.deleteChatClicked.emit(chat);
  }

  refreshChats(): void {
    this.refreshChatsClicked.emit();
  }

  filterChange(event: MatCheckboxChange, value: string): void {
    this.checkedStatuses.update((checkedSt) => {
      checkedSt[value] = event.checked;
      return { ...checkedSt };
    });
  }

  filterClosed(): void {
    const statuses = Object.keys(this.checkedStatuses()).filter(
      (key) => this.checkedStatuses()[key],
    ) as MsgChatStatus[];
    this.statusFilterChanged.emit(statuses);
  }

  toggleAllFilters(event: MouseEvent, value: boolean): void {
    event.stopPropagation();
    const statuses = this.checkedStatuses();
    for (const statusKey in statuses) {
      statuses[statusKey] = value;
    }
    this.checkedStatuses.set(statuses);
  }
}
