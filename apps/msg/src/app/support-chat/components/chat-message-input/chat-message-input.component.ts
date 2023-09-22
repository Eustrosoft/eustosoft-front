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
import { TextareaComponent } from '@eustrosoft-front/common-ui';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';

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

  @ViewChild(TextareaComponent)
  messageInputComponent!: TextareaComponent;

  private el = inject(ElementRef);
  private destroy$ = new Subject<void>();

  control = new FormControl('', {
    nonNullable: true,
  });

  ngOnInit(): void {
    fromEvent<KeyboardEvent>(this.el.nativeElement, 'keydown')
      .pipe(
        filter(
          (event: KeyboardEvent) => event.ctrlKey && event.key === 'Enter'
        ),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.submitMessage()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('messageInEdit' in changes) {
      this.control.setValue(this.messageInEdit?.content || '');
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
    this.control.setValue('');
  }

  focusOnInput(): void {
    this.messageInputComponent?.input?.focus();
  }
}
