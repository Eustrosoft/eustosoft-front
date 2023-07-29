/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { Ticket } from './interfaces/ticket.interface';
import { Observable } from 'rxjs';
import { TicketsService } from './services/tickets.service';
import { TicketMessage } from './interfaces/ticket-message.interface';
import { TicketMessagesService } from './services/ticket-messages.service';

@Component({
  selector: 'eustrosoft-front-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportChatComponent implements OnInit {
  ticketsService = inject(TicketsService);
  ticketMessagesService = inject(TicketMessagesService);

  tickets$!: Observable<Ticket[]>;
  ticketMessages$!: Observable<TicketMessage[]>;
  selectedTicket!: Ticket;
  isCollapsed = true;
  isXs = false;

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.setUpSidebar();
  }

  ngOnInit(): void {
    this.tickets$ = this.ticketsService.getTickets();
    this.setUpSidebar();
  }

  setUpSidebar() {
    if (window.innerWidth <= 576) {
      this.isCollapsed = true;
      this.isXs = true;
    } else {
      this.isCollapsed = false;
      this.isXs = false;
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  ticketSelected(ticket: Ticket) {
    this.selectedTicket = ticket;
    this.ticketMessages$ = this.ticketMessagesService.getMessages(ticket.id);
  }
}
