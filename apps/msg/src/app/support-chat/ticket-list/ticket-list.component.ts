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
} from '@angular/core';
import { Ticket } from '../interfaces/ticket.interface';
import { User } from '../interfaces/user.interface';

@Component({
  selector: 'eustrosoft-front-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketListComponent {
  @Input() tickets!: Ticket[];
  @Input() removeBorderRadius!: boolean;
  @Output() ticketSelected = new EventEmitter<Ticket>();
  @Output() collapseClicked = new EventEmitter<void>();
  @Output() userChanged = new EventEmitter<User>();

  selectedTicket: Ticket | undefined = undefined;
  numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  selectTicket(ticket: Ticket) {
    this.selectedTicket = ticket;
    this.ticketSelected.emit(ticket);
  }

  changeCurrentUser(id: number) {
    this.userChanged.emit({
      id,
      name: `User ${id}`,
    });
    this.selectedTicket = undefined;
  }
}
