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
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  Chat,
  ChatMessage,
  MsgSubjects,
  MsgSubjectsService,
} from '@eustrosoft-front/msg-lib';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  tap,
} from 'rxjs';
import { MatInput, MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'eustrosoft-front-chat-message-input',
  templateUrl: './chat-message-input.component.html',
  styleUrls: ['./chat-message-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    TextFieldModule,
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    TranslateModule,
  ],
})
export class ChatMessageInputComponent
  implements OnInit, OnChanges, AfterViewInit
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
  private readonly destroyRef = inject(DestroyRef);

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
        takeUntilDestroyed(this.destroyRef),
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
