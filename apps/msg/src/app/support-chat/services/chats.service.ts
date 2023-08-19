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
import { Chat } from '../interfaces/chat.interface';
import { LocalDbNameEnum } from '../constants/enums/local-db-name.enum';
import { User } from '../interfaces/user.interface';

@Injectable()
export class ChatsService {
  getChats(userId: number): Observable<Chat[]> {
    return of(localStorage.getItem(LocalDbNameEnum.TIS_TICKET)).pipe(
      switchMap((value) =>
        iif(
          () => typeof value === 'string',
          of(value as string),
          throwError(() => 'Unable to parse TIS_TICKET json from localStorage')
        )
      ),
      map<string, Chat[]>((value) => JSON.parse(value)),
      map((chats) =>
        chats.filter((chat) => chat.users.some((user) => user.id === userId))
      ),
      catchError((error: string) => {
        console.error('Error occurred:', error);
        return EMPTY;
      })
    );
  }

  addChats(name: string, owner: User, users: User[]): Chat {
    const tickets = JSON.parse(
      localStorage.getItem(LocalDbNameEnum.TIS_TICKET) as string
    ) as Chat[];
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
