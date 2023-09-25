/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Subsystems } from '../../constants/enums/subsystems.enum';
import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';
import { MsgRequestActions } from '../../constants/enums/msg-actions.enum';
import { Chat } from './chat.interface';
import { ChatMessage } from './chat-message.interface';

interface BaseMsgResponse {
  s: Subsystems.MSG;
  r: MsgRequestActions;
  e: number;
  m: string;
  l: SupportedLanguages;
}

export interface ViewChatsResponse extends BaseMsgResponse {
  r: MsgRequestActions.VIEW_CHATS;
  chats: Chat[];
}

export interface ViewChatResponse extends BaseMsgResponse {
  r: MsgRequestActions.VIEW_CHAT;
  messages: ChatMessage[];
}

export interface CreateChatResponse extends BaseMsgResponse {
  r: MsgRequestActions.CREATE_CHAT;
  id: number;
}

export interface SendMessageChatResponse extends BaseMsgResponse {
  r: MsgRequestActions.SEND_MESSAGE;
}

export interface EditMessageChatResponse extends BaseMsgResponse {
  r: MsgRequestActions.EDIT_MESSAGE;
}

export interface DeleteMessageChatResponse extends BaseMsgResponse {
  r: MsgRequestActions.DELETE_MESSAGE;
}

export interface ChangeChatStatusResponse extends BaseMsgResponse {
  r: MsgRequestActions.CHANGE_CHAT_STATUS;
}
