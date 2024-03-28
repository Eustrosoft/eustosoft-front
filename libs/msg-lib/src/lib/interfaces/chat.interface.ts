/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { MsgChatStatus } from '../constants/enums/msg-chat-status.enum';

export interface Chat {
  hasUpdates: boolean;
  documentId: number;
  subject: string;
  status: MsgChatStatus;
  zoid: number;
  zver: number; // version
  zrid: number;
  zsid: number | null | undefined; // scope
  zlvl: number | null | undefined; // security level
}
