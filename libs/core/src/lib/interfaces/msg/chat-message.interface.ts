/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { MessageType } from '../../constants/enums/msg-edit-type.enum';

export interface ChatMessage {
  content: string;
  answerId: number;
  type: MessageType;
  user: {
    id: number;
    username: string;
  };
  zoid: number;
  zver: number;
  zrid: number;
}
