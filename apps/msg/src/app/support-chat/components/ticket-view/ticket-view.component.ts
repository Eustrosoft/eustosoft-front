/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Ticket } from '../../interfaces/ticket.interface';
import { TicketMessage } from '../../interfaces/ticket-message.interface';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'eustrosoft-front-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketViewComponent {
  @Input() selectedTicket: Ticket | undefined = undefined;
  @Input() selectedUser: User | undefined = undefined;
  @Input() selectedTicketMessages!: TicketMessage[];
  @Output() collapseClicked = new EventEmitter<void>();
  @Output() sendMessageClicked = new EventEmitter<string>();

  @ViewChild('messagesVirtualScrollViewport')
  messagesVirtualScrollViewport!: CdkVirtualScrollViewport;

  control = new FormControl('', {
    nonNullable: true,
  });

  sendMessage() {
    if (this.control.value.length === 0) {
      return;
    }
    this.sendMessageClicked.emit(this.control.value);
    this.control.reset('');
  }
  // scrollToBottom() {
  //   // TODO работает не корректно, то скроллит на середину, то в конец, то не скроллит вовсе, нужно переделывать
  //   setTimeout(() => {
  //     this.messagesVirtualScrollViewport.scrollTo({
  //       bottom: 0,
  //       behavior: 'auto',
  //     });
  //   }, 10);
  // }
  //
  // ngOnChanges(changes: SimpleChanges): void {
  //   if ('selectedTicket' in changes) {
  //     this.scrollToBottom();
  //   }
  // }

  // ngAfterViewInit(): void {
  //   this.scrollToBottom();
  // }
  protected readonly undefined = undefined;
}
