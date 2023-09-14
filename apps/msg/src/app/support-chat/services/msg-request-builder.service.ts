/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  CreateChatRequest,
  DeleteMessageChatRequest,
  EditMessageChatRequest,
  MsgRequestActions,
  QtisRequestResponseInterface,
  SendMessageChatRequest,
  Subsystems,
  SupportedLanguages,
  ViewChatRequest,
  ViewChatsRequest,
} from '@eustrosoft-front/core';

@Injectable()
export class MsgRequestBuilderService {
  buildViewChatsRequest(): Observable<
    QtisRequestResponseInterface<ViewChatsRequest>
  > {
    return of({
      r: [
        {
          s: Subsystems.MSG,
          r: MsgRequestActions.VIEW_CHATS,
          l: SupportedLanguages.EN_US,
        },
      ],
      t: 0,
    });
  }
  buildViewChatRequest(
    zoid: number
  ): Observable<QtisRequestResponseInterface<ViewChatRequest>> {
    return of({
      r: [
        {
          s: Subsystems.MSG,
          r: MsgRequestActions.VIEW_CHAT,
          l: SupportedLanguages.EN_US,
          params: {
            zoid,
          },
        },
      ],
      t: 0,
    });
  }

  buildCreateChatRequest(
    params: CreateChatRequest['params']
  ): Observable<QtisRequestResponseInterface<CreateChatRequest>> {
    return of({
      r: [
        {
          s: Subsystems.MSG,
          r: MsgRequestActions.CREATE_CHAT,
          l: SupportedLanguages.EN_US,
          params,
        },
      ],
      t: 0,
    });
  }

  buildSendMessageToChatRequest(
    params: SendMessageChatRequest['params']
  ): Observable<QtisRequestResponseInterface<SendMessageChatRequest>> {
    return of({
      r: [
        {
          s: Subsystems.MSG,
          r: MsgRequestActions.SEND_MESSAGE,
          l: SupportedLanguages.EN_US,
          params,
        },
      ],
      t: 0,
    });
  }

  buildEditMessageRequest(
    params: EditMessageChatRequest['params']
  ): Observable<QtisRequestResponseInterface<EditMessageChatRequest>> {
    return of({
      r: [
        {
          s: Subsystems.MSG,
          r: MsgRequestActions.EDIT_MESSAGE,
          l: SupportedLanguages.EN_US,
          params,
        },
      ],
      t: 0,
    });
  }

  buildDeleteMessageToChatRequest(
    params: DeleteMessageChatRequest['params']
  ): Observable<QtisRequestResponseInterface<DeleteMessageChatRequest>> {
    return of({
      r: [
        {
          s: Subsystems.MSG,
          r: MsgRequestActions.DELETE_MESSAGE,
          l: SupportedLanguages.EN_US,
          params,
        },
      ],
      t: 0,
    });
  }
}
