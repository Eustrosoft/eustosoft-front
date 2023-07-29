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
        messages.filter((message) => message.ticketId === ticketId)
      ),
      catchError((error: string) => {
        console.error('Error occurred:', error);
        return EMPTY;
      })
    );
  }
}
