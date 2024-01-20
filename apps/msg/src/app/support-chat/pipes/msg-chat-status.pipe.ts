/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { MsgChatStatus } from '@eustrosoft-front/msg-lib';

@Pipe({
  name: 'msgChatStatus',
  standalone: true,
})
export class MsgChatStatusPipe implements PipeTransform {
  transform(value: MsgChatStatus): string {
    for (const key of Object.keys(MsgChatStatus)) {
      if (MsgChatStatus[key as keyof typeof MsgChatStatus] === value) {
        return key;
      }
    }
    return '';
  }
}
