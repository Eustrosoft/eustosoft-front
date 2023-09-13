import { Pipe, PipeTransform } from '@angular/core';
import { MsgChatStatus } from '@eustrosoft-front/core';

@Pipe({
  name: 'msgChatStatus',
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
