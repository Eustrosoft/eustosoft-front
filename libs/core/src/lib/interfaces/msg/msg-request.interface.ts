/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Subsystems } from '../../constants/enums/subsystems.enum';
import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';
import { MsgRequestActions } from '../../constants/enums/msg-request-actions.enum';
import { MessageType } from '../../constants/enums/msg-edit-type.enum';
import { MsgChatStatus } from '../../constants/enums/msg-chat-status.enum';

interface BaseMsgRequest {
  s: Subsystems;
  r: MsgRequestActions;
  l: SupportedLanguages;
}

export interface ViewChatsRequest extends BaseMsgRequest {
  s: Subsystems.MSG;
  r: MsgRequestActions.VIEW_CHATS;
  params: {
    statuses: MsgChatStatus[];
  };
}

export interface ViewChatRequest extends BaseMsgRequest {
  s: Subsystems.MSG;
  r: MsgRequestActions.VIEW_CHAT;
  params: {
    zoid: number;
  };
}

export interface CreateChatRequest extends BaseMsgRequest {
  s: Subsystems.MSG;
  r: MsgRequestActions.CREATE_CHAT;
  params: {
    subject: string;
    content: string; // first message
    slvl?: number;
    zsid?: number;
  };
}

export interface SendChatMessageRequest extends BaseMsgRequest {
  s: Subsystems.MSG;
  r: MsgRequestActions.SEND_MESSAGE;
  params: {
    zoid: number; // chat id
    content: string;
    reference: string;
    type: MessageType.MESSAGE;
  };
}

export interface EditChatMessageRequest extends BaseMsgRequest {
  s: Subsystems.MSG;
  r: MsgRequestActions.EDIT_MESSAGE;
  params: {
    zoid: number; // chatId
    zrid: number; // messageId
    content: string;
    reference: string;
    type: MessageType;
  };
}

export interface DeleteChatMessageRequest extends BaseMsgRequest {
  s: Subsystems.MSG;
  r: MsgRequestActions.DELETE_MESSAGE;
  params: {
    zoid: number; // chatId
    zrid: number; // messageId
  };
}

export interface ChangeChatStatusRequest extends BaseMsgRequest {
  s: Subsystems.MSG;
  r: MsgRequestActions.CHANGE_CHAT_STATUS;
  params: {
    zoid: number; // chatId
    zrid: number; // messageId
    subject: string; // new subject
    reference: unknown;
    status: MsgChatStatus;
  };
}

export interface DeleteChatRequest extends BaseMsgRequest {
  s: Subsystems.MSG;
  r: MsgRequestActions.DELETE_CHAT;
  params: {
    zoid: number;
    zver: number;
  };
}
