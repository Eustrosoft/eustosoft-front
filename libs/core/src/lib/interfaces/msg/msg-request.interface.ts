/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Subsystems } from '../../constants/enums/subsystems.enum';
import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';
import { MsgRequestActions } from '../../constants/enums/msg-actions.enum';
import { MessageType } from '../../constants/enums/msg-edit-type.enum';

interface BaseMsgRequest {
  s: Subsystems;
  r: MsgRequestActions;
  l: SupportedLanguages;
}

export interface ViewChatsRequest extends BaseMsgRequest {
  s: Subsystems.MSG;
  r: MsgRequestActions.VIEW_CHATS;
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
}

export interface SendMessageChatRequest extends BaseMsgRequest {
  s: Subsystems.MSG;
  r: MsgRequestActions.SEND_MESSAGE;
  params: {
    zoid: number; // chat id
    content: string;
    reference: string;
    type: MessageType.MESSAGE;
  };
}

export interface EditMessageChatRequest extends BaseMsgRequest {
  s: Subsystems.MSG;
  r: MsgRequestActions.EDIT_MESSAGE;
  params: {
    id: number;
    content: string;
    reference: string;
    type: MessageType;
  };
}

export interface DeleteMessageChatRequest extends BaseMsgRequest {
  s: Subsystems.MSG;
  r: MsgRequestActions.DELETE_MESSAGE;
  id: number;
}
