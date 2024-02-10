/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  QtisRequestResponse,
  Subsystems,
  SupportedLanguages,
} from '@eustrosoft-front/core';
import {
  ChangeChatStatusRequest,
  CreateChatRequest,
  DeleteChatMessageRequest,
  DeleteChatRequest,
  EditChatMessageRequest,
  MsgRequestActions,
  SendChatMessageRequest,
  UpdateChatListRequest,
  ViewChatRequest,
  ViewChatsRequest,
} from '@eustrosoft-front/msg-lib';

@Injectable({ providedIn: 'root' })
export class MsgRequestBuilderService {
  buildViewChatsRequest(
    params: ViewChatsRequest['params'],
  ): Observable<QtisRequestResponse<ViewChatsRequest>> {
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
  ): Observable<QtisRequestResponse<ViewChatRequest>> {
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
  ): Observable<QtisRequestResponse<CreateChatRequest>> {
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
  ): Observable<QtisRequestResponse<SendChatMessageRequest>> {
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
  ): Observable<QtisRequestResponse<EditChatMessageRequest>> {
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
  ): Observable<QtisRequestResponse<DeleteChatMessageRequest>> {
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
  ): Observable<QtisRequestResponse<DeleteChatRequest>> {
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
  ): Observable<QtisRequestResponse<ChangeChatStatusRequest>> {
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
  ): Observable<QtisRequestResponse<UpdateChatListRequest>> {
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
