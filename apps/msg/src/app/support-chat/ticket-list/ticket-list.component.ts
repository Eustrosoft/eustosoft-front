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
  OnInit,
  Output,
} from '@angular/core';
import { Ticket } from '../interfaces/ticket.interface';

@Component({
  selector: 'eustrosoft-front-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketListComponent implements OnInit {
  @Input() tickets!: Ticket[];
  @Input() removeBorderRadius!: boolean;
  @Output() ticketSelected = new EventEmitter<Ticket>();
  @Output() collapseClicked = new EventEmitter<void>();

  selectedTicket: Ticket | undefined = undefined;

  ngOnInit(): void {
    // this.selectedTicket = this.tickets[0];
  }

  selectTicket(ticket: Ticket) {
    this.selectedTicket = ticket;
    this.ticketSelected.emit(ticket);
  }
}
