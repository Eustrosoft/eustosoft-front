/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  ChangeChatStatusRequest,
  CreateChatRequest,
  DeleteChatMessageRequest,
  DeleteChatRequest,
  EditChatMessageRequest,
  MsgRequestActions,
  QtisRequestResponseInterface,
  SendChatMessageRequest,
  Subsystems,
  SupportedLanguages,
  UpdateChatListRequest,
  ViewChatRequest,
  ViewChatsRequest,
} from '@eustrosoft-front/core';

@Injectable()
export class MsgRequestBuilderService {
  buildViewChatsRequest(
    params: ViewChatsRequest['params'],
  ): Observable<QtisRequestResponseInterface<ViewChatsRequest>> {
    return of({
      r: [
        {
          s: Subsystems.MSG,
          r: MsgRequestActions.VIEW_CHATS,
          l: SupportedLanguages.EN_US,
          params,
        },
      ],
      t: 0,
    });
  }
  buildViewChatRequest(
    zoid: number,
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
    params: CreateChatRequest['params'],
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
    params: SendChatMessageRequest['params'],
  ): Observable<QtisRequestResponseInterface<SendChatMessageRequest>> {
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
    params: EditChatMessageRequest['params'],
  ): Observable<QtisRequestResponseInterface<EditChatMessageRequest>> {
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

  buildDeleteChatMessageRequest(
    params: DeleteChatMessageRequest['params'],
  ): Observable<QtisRequestResponseInterface<DeleteChatMessageRequest>> {
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

  buildDeleteChatRequest(
    params: DeleteChatRequest['params'],
  ): Observable<QtisRequestResponseInterface<DeleteChatRequest>> {
    return of({
      r: [
        {
          s: Subsystems.MSG,
          r: MsgRequestActions.DELETE_CHAT,
          l: SupportedLanguages.EN_US,
          params,
        },
      ],
      t: 0,
    });
  }

  buildChangeChatStatusRequest(
    params: ChangeChatStatusRequest['params'],
  ): Observable<QtisRequestResponseInterface<ChangeChatStatusRequest>> {
    return of({
      r: [
        {
          s: Subsystems.MSG,
          r: MsgRequestActions.CHANGE_CHAT_STATUS,
          l: SupportedLanguages.EN_US,
          params,
        },
      ],
      t: 0,
    });
  }

  buildUpdateChatListRequest(
    params: UpdateChatListRequest['params'],
  ): Observable<QtisRequestResponseInterface<UpdateChatListRequest>> {
    return of({
      r: [
        {
          s: Subsystems.MSG,
          r: MsgRequestActions.UPDATE,
          l: SupportedLanguages.EN_US,
          params,
        },
      ],
      t: 0,
    });
  }
}
