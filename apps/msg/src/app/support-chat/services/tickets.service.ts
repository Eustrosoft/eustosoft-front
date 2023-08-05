import { Injectable } from '@angular/core';
import {
  catchError,
  EMPTY,
  iif,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { Ticket } from '../interfaces/ticket.interface';
import { LocalDbNameEnum } from '../constants/enums/local-db-name.enum';
import { User } from '../interfaces/user.interface';

@Injectable()
export class TicketsService {
  getTickets(userId: number): Observable<Ticket[]> {
    return of(localStorage.getItem(LocalDbNameEnum.TIS_TICKET)).pipe(
      switchMap((value) =>
        iif(
          () => typeof value === 'string',
          of(value as string),
          throwError(() => 'Unable to parse TIS_TICKET json from localStorage')
        )
      ),
      map<string, Ticket[]>((value) => JSON.parse(value)),
      map((tickets) =>
        tickets.filter((ticket) =>
          ticket.users.some((user) => user.id === userId)
        )
      ),
      catchError((error: string) => {
        console.error('Error occurred:', error);
        return EMPTY;
      })
    );
  }

  addTicket(name: string, owner: User, users: User[]): Ticket {
    const tickets = JSON.parse(
      localStorage.getItem(LocalDbNameEnum.TIS_TICKET) as string
    ) as Ticket[];
    const lastId = tickets[tickets.length - 1].id;
    const date = new Date();

    const ticket = {
      id: lastId + 1,
      name: name,
      time_created: `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`,
      owner: owner,
      users: [owner, ...users],
      active: true,
    };
    tickets.push(ticket);

    localStorage.setItem(LocalDbNameEnum.TIS_TICKET, JSON.stringify(tickets));

    return ticket;
  }
}
