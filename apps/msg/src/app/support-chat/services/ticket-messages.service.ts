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
import { LocalDbNameEnum } from '../constants/enums/local-db-name.enum';
import { TicketMessage } from '../interfaces/ticket-message.interface';
import { User } from '../interfaces/user.interface';

@Injectable()
export class TicketMessagesService {
  getMessages(ticketId: number): Observable<TicketMessage[]> {
    return of(localStorage.getItem(LocalDbNameEnum.TIS_MESSAGE)).pipe(
      switchMap((value) =>
        iif(
          () => typeof value === 'string',
          of(value as string),
          throwError(() => 'Unable to parse TIS_MESSAGE json from localStorage')
        )
      ),
      map<string, TicketMessage[]>((value) => JSON.parse(value)),
      map((messages) =>
        messages.filter((message) => message.chat_id === ticketId)
      ),
      catchError((error: string) => {
        console.error('Error occurred:', error);
        return EMPTY;
      })
    );
  }

  addMessage(ticketId: number, message: string, user: User): TicketMessage {
    const messages = JSON.parse(
      localStorage.getItem(LocalDbNameEnum.TIS_MESSAGE) as string
    ) as TicketMessage[];
    const lastId = messages[messages.length - 1].id;

    const ticketMessage = {
      id: lastId + 1,
      chat_id: ticketId,
      user_id: user.id,
      user_name: user.name,
      text: message,
      content: null,
      time_created: new Date().toISOString(),
      time_changed: '',
    };

    messages.push(ticketMessage);

    localStorage.setItem(LocalDbNameEnum.TIS_MESSAGE, JSON.stringify(messages));

    return ticketMessage;
  }
}
