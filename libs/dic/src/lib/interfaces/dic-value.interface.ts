/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { MsgChatStatus } from '@eustrosoft-front/msg-lib';

export interface DicValue {
  dic: string;
  code: MsgChatStatus;
  value: string;
  descr: string;
}
