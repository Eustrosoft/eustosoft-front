/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { MessageType } from '../../constants/enums/msg-edit-type.enum';

export interface ChatMessage {
  id: number;
  content: string;
  reference: unknown;
  type: MessageType;
  user: {
    id: number;
    username: string;
    role: string;
  };
}
