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
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TicketMock } from '../ticket-mocks.interface';

@Component({
  selector: 'eustrosoft-front-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketListComponent implements OnInit, OnChanges {
  @Input() tickets!: TicketMock[];
  @Input() removeBorderRadius!: boolean;
  @Output() ticketSelected = new EventEmitter<TicketMock>();
  @Output() collapseClicked = new EventEmitter<void>();

  selectedTicket!: TicketMock;

  ngOnInit(): void {
    this.selectedTicket = this.tickets[0];
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
    // console.log(this.removeBorderRadius);
  }

  selectTicket(ticket: TicketMock) {
    this.selectedTicket = ticket;
    this.ticketSelected.emit(ticket);
  }
}
