/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { MsgChatStatus } from '../../constants/enums/msg-chat-status.enum';

export interface Chat {
  id: number;
  subject: string;
  status: MsgChatStatus;
  document: unknown;
}
