import { Injectable } from '@angular/core';

@Injectable()
export class ChatMessagesService {
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
