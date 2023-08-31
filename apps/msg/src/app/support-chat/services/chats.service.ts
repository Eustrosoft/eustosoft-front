import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import {
  Chat,
  MsgChatStatus,
  QtisRequestResponseInterface,
} from '@eustrosoft-front/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '@eustrosoft-front/config';

@Injectable()
export class ChatsService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);
  getChats(): Observable<Chat[]> {
    return of([
      {
        id: 1,
        subject: 'Help with Account Access',
        status: MsgChatStatus.OPEN,
        document: null,
      },
      {
        id: 2,
        subject: 'Product Inquiry',
        status: MsgChatStatus.OPEN,
        document: null,
      },
      {
        id: 3,
        subject: 'Technical Support',
        status: MsgChatStatus.CLOSED,
        document: null,
      },
      {
        id: 4,
        subject: 'Order Status',
        status: MsgChatStatus.OPEN,
        document: null,
      },
      {
        id: 5,
        subject: 'Feedback',
        status: MsgChatStatus.OPEN,
        document: null,
      },
      {
        id: 6,
        subject: 'Cancellation Request',
        status: MsgChatStatus.CLOSED,
        document: null,
      },
      {
        id: 7,
        subject: 'Account Update',
        status: MsgChatStatus.OPEN,
        document: null,
      },
      {
        id: 8,
        subject: 'Promotions',
        status: MsgChatStatus.OPEN,
        document: null,
      },
      {
        id: 9,
        subject: 'Billing Inquiry',
        status: MsgChatStatus.OPEN,
        document: null,
      },
      {
        id: 10,
        subject: 'New Feature Request',
        status: MsgChatStatus.CLOSED,
        document: null,
      },
    ]);
  }

  // addChats(subject: string): Observable<Chat> {
  //   return of({
  //     id: 35,
  //     subject,
  //     status: MsgChatStatus.OPEN,
  //     document: null,
  //   });
  // }

  dispatch<Req, Res>(
    body: QtisRequestResponseInterface<Req>
  ): Observable<QtisRequestResponseInterface<Res>> {
    return this.config.pipe(
      switchMap((config) =>
        this.http.post<QtisRequestResponseInterface<Res>>(
          `${config.apiUrl}/dispatch`,
          body
        )
      )
    );
  }
}
