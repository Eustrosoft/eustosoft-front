import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChatMessage, MessageType } from '@eustrosoft-front/core';

@Injectable()
export class ChatMessagesService {
  getMessages(ticketId: number): Observable<ChatMessage[]> {
    return of([
      {
        id: 1,
        content: 'Hello there!',
        reference: null,
        type: MessageType.MESSAGE,
        user: {
          id: 101,
          username: 'user123',
          role: 'user',
        },
      },
      {
        id: 2,
        content: 'I agree!',
        reference: null,
        type: MessageType.LIKE,
        user: {
          id: 102,
          username: 'user456',
          role: 'user',
        },
      },
      {
        id: 3,
        content: 'How would you rate our service?',
        reference: null,
        type: MessageType.SURVEY,
        user: {
          id: 103,
          username: 'user789',
          role: 'user',
        },
      },
      {
        id: 4,
        content: 'Yes, that worked for me.',
        reference: null,
        type: MessageType.ANSWER,
        user: {
          id: 104,
          username: 'support_agent1',
          role: 'support',
        },
      },
    ]);
  }

  // addMessage(ticketId: number, message: string, user: User): ChatMessage {
  //   const messages = JSON.parse(
  //     localStorage.getItem(LocalDbNameEnum.TIS_MESSAGE) as string
  //   ) as ChatMessage[];
  //   const lastId = messages[messages.length - 1].id;
  //
  //   const ticketMessage = {
  //     id: lastId + 1,
  //     chat_id: ticketId,
  //     user_id: user.id,
  //     user_name: user.name,
  //     text: message,
  //     content: null,
  //     time_created: new Date().toISOString(),
  //     time_changed: '',
  //   };
  //
  //   messages.push(ticketMessage);
  //
  //   localStorage.setItem(LocalDbNameEnum.TIS_MESSAGE, JSON.stringify(messages));
  //
  //   return ticketMessage;
  // }
  //
  // putMessage(message: ChatMessage): ChatMessage {
  //   const messages = JSON.parse(
  //     localStorage.getItem(LocalDbNameEnum.TIS_MESSAGE) as string
  //   ) as ChatMessage[];
  //
  //   const storedMsgIndex = messages.findIndex((msg) => msg.id === message.id);
  //
  //   const updatedMessage = (messages[storedMsgIndex] = {
  //     ...messages[storedMsgIndex],
  //     text: message.text,
  //     time_changed: new Date().toISOString(),
  //   });
  //
  //   localStorage.setItem(LocalDbNameEnum.TIS_MESSAGE, JSON.stringify(messages));
  //
  //   return updatedMessage;
  // }
}
