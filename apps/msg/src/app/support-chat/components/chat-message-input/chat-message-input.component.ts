/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chat, ChatMessage } from '@eustrosoft-front/core';
import { FormControl } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { MsgSubjectsService } from '../../services/msg-subjects.service';
import { MsgSubjects } from '../../contants/enums/msg-subjects.enum';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'eustrosoft-front-chat-message-input',
  templateUrl: './chat-message-input.component.html',
  styleUrls: ['./chat-message-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageInputComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @Input() label!: string;
  @Input() placeholder!: string;
  @Input() iconButtonName!: string;
  @Input() selectedChat: Chat | undefined = undefined;
  @Input() messageInEdit: ChatMessage | undefined = undefined;

  @Output() messageSent = new EventEmitter<string>();
  @Output() messageEdited = new EventEmitter<string>();
  @Output() messageDeleted = new EventEmitter<ChatMessage>();
  @Output() messageEditCanceled = new EventEmitter<void>();

  @ViewChild(MatInput) messageInput!: MatInput;

  private readonly el = inject(ElementRef);
  private readonly msgSubjectsService = inject(MsgSubjectsService);
  private readonly destroy$ = new Subject<void>();

  protected control = new FormControl('', {
    nonNullable: true,
  });

  ngOnInit(): void {
    fromEvent<KeyboardEvent>(this.el.nativeElement, 'keydown')
      .pipe(
        filter(
          (event: KeyboardEvent) => event.ctrlKey && event.key === 'Enter',
        ),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.submitMessage()),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.msgSubjectsService
      .getSubjectObservable(MsgSubjects.MESSAGE_SUCCESSFULLY_SENT)
      .pipe(
        tap(() => {
          this.control.setValue('');
        }),
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('messageInEdit' in changes) {
      this.control.setValue(this.messageInEdit?.content ?? '');
      if (changes['messageInEdit'].currentValue) {
        this.focusOnInput();
      }
    }
    if ('selectedChat' in changes) {
      this.focusOnInput();
    }
  }

  ngAfterViewInit(): void {
    this.focusOnInput();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitMessage(): void {
    if (this.control.value.length === 0 && this.messageInEdit) {
      this.messageDeleted.emit(this.messageInEdit as ChatMessage);
      return;
    }
    if (this.control.value.length === 0) {
      return;
    }
    if (this.messageInEdit) {
      this.messageEdited.emit(this.control.value);
      return;
    }
    this.messageSent.emit(this.control.value);
  }

  cancelEdit(): void {
    this.messageEditCanceled.emit();
  }

  focusOnInput(): void {
    this.messageInput?.focus();
  }
}
