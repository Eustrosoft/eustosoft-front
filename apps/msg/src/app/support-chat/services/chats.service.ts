import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Chat, MsgChatStatus } from '@eustrosoft-front/core';

@Injectable()
export class ChatsService {
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
}
