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
import {
  BehaviorSubject,
  combineLatest,
  filter,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { TicketsService } from './services/tickets.service';
import { TicketMessage } from './interfaces/ticket-message.interface';
import { TicketMessagesService } from './services/ticket-messages.service';
import { User } from './interfaces/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { CreateTicketDialogComponent } from './components/create-ticket-dialog/create-ticket-dialog.component';
import { CreateTicketDialogDataInterface } from './components/create-ticket-dialog/create-ticket-dialog-data.interface';
import { CreateTicketDialogReturnDataInterface } from './components/create-ticket-dialog/create-ticket-dialog-return-data.interface';
import { MockService } from './services/mock.service';

@Component({
  selector: 'eustrosoft-front-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportChatComponent implements OnInit {
  private ticketsService = inject(TicketsService);
  private ticketMessagesService = inject(TicketMessagesService);
  private mockService = inject(MockService);
  private dialog = inject(MatDialog);

  tickets$!: Observable<Ticket[]>;
  ticketMessages$!: Observable<TicketMessage[]>;
  refreshTicketsView$ = new BehaviorSubject(true);
  refreshTicketMessagesView$ = new BehaviorSubject<number | undefined>(
    undefined
  );
  selectedTicket: Ticket | undefined = undefined;
  selectedUser: User = { id: 1, name: 'User 1' };
  isCollapsed = true;
  isXs = false;

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.setUpSidebar();
  }

  ngOnInit(): void {
    this.tickets$ = combineLatest([this.refreshTicketsView$]).pipe(
      switchMap(() => this.ticketsService.getTickets(this.selectedUser.id))
    );
    this.ticketMessages$ = combineLatest([
      this.refreshTicketMessagesView$.pipe(
        filter((id): id is number => typeof id !== 'undefined')
      ),
    ]).pipe(switchMap(([id]) => this.ticketMessagesService.getMessages(id)));
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
    this.refreshTicketMessagesView$.next(ticket.id);
  }

  userChanged(user: User) {
    this.selectedUser = user;
    this.refreshTicketsView$.next(true);
    this.selectedTicket = undefined;
  }

  createNewTicket() {
    const dialogRef = this.dialog.open<
      CreateTicketDialogComponent,
      CreateTicketDialogDataInterface,
      CreateTicketDialogReturnDataInterface
    >(CreateTicketDialogComponent, {
      data: {
        title: 'Create new ticket',
        subjectInputLabel: 'Subject',
        messageInputLabel: 'Message',
        cancelButtonText: 'Cancel',
        submitButtonText: 'Create',
      },
      minHeight: '25vh',
      minWidth: '50vw',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter(
          (data): data is CreateTicketDialogReturnDataInterface =>
            typeof data !== 'undefined'
        ),
        switchMap((ticketData) => {
          const users: User[] = this.mockService.generateMockUsers(10);
          const ticketUsers = this.mockService.getRandomUsers(
            users,
            Math.floor(Math.random() * 9) + 2
          );
          return combineLatest([of(ticketData), of(ticketUsers)]);
        }),
        switchMap(([ticketData, ticketUsers]) =>
          combineLatest([
            of(ticketData),
            of(
              this.ticketsService.addTicket(
                ticketData.subject,
                this.selectedUser,
                ticketUsers
              )
            ),
          ])
        ),
        switchMap(([ticketData, createdTicket]) => {
          this.ticketMessagesService.addMessage(
            createdTicket.id,
            ticketData.message,
            this.selectedUser
          );
          return of(createdTicket);
        }),
        tap((createdTicket) => {
          this.refreshTicketsView$.next(true);
          this.ticketSelected(createdTicket);
        }),
        take(1)
      )
      .subscribe();
  }

  sendMessage(message: string) {
    this.ticketMessagesService.addMessage(
      this.selectedTicket?.id as number,
      message,
      this.selectedUser
    );
    this.refreshTicketMessagesView$.next(this.selectedTicket?.id as number);
  }

  editMessage(message: TicketMessage) {
    this.ticketMessagesService.putMessage(message);
    this.refreshTicketMessagesView$.next(this.selectedTicket?.id as number);
  }
}
