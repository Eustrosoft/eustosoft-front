import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Author, TicketMock } from '../ticket-mocks.interface';
import { FormControl } from '@angular/forms';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'eustrosoft-front-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketViewComponent implements AfterViewInit, OnChanges {
  @Input() selectedTicket!: TicketMock;
  @Output() collapseClicked = new EventEmitter<void>();

  @ViewChild('messagesVirtualScrollViewport')
  messagesVirtualScrollViewport!: CdkVirtualScrollViewport;

  control = new FormControl('', {
    nonNullable: true,
  });
  msgAuthor = Author;

  scrollToBottom() {
    setTimeout(() => {
      this.messagesVirtualScrollViewport.scrollTo({
        bottom: 0,
        behavior: 'auto',
      });
    }, 10);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('selectedTicket' in changes) {
      this.scrollToBottom();
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }
}
