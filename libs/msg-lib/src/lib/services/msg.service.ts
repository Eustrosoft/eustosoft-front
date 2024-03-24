/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  delay,
  interval,
  map,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { Chat } from '../interfaces/chat.interface';
import { MsgChatStatus } from '../constants/enums/msg-chat-status.enum';
import { DispatchService, QtisRequestResponse } from '@eustrosoft-front/core';
import {
  ChangeChatStatusRequest,
  CreateChatRequest,
  DeleteChatMessageRequest,
  DeleteChatRequest,
  EditChatMessageRequest,
  SendChatMessageRequest,
  UpdateChatListRequest,
  ViewChatsRequest,
} from '../interfaces/msg-request.interface';
import {
  ChangeChatStatusResponse,
  CreateChatResponse,
  DeleteChatMessageResponse,
  DeleteChatResponse,
  EditChatMessageResponse,
  SendChatMessageResponse,
  UpdateChatListResponse,
  ViewChatsResponse,
} from '../interfaces/msg-response.interface';
import { MsgRequestBuilderService } from './msg-request-builder.service';
import { ChatVersion } from '../interfaces/chat-version.type';
import { CreateChatDialogReturnData } from '../interfaces/create-chat-dialog-return-data.interface';

@Injectable({ providedIn: 'root' })
export class MsgService {
  private readonly dispatchService = inject(DispatchService);
  private readonly msgRequestBuilderService = inject(MsgRequestBuilderService);

  chatListRefreshInterval$ = interval(5000).pipe(startWith(1));
  fetchChatsByStatuses$ = new BehaviorSubject<MsgChatStatus[]>([]);
  fetchChatMessagesByChatId$ = new BehaviorSubject<number | undefined>(
    undefined,
  );

  getChats$(statuses: MsgChatStatus[]): Observable<{
    chats: Chat[] | undefined;
    isLoading: boolean;
    isError: boolean;
  }> {
    return this.msgRequestBuilderService
      .buildViewChatsRequest({
        statuses,
      })
      .pipe(
        switchMap((req: QtisRequestResponse<ViewChatsRequest>) =>
          this.dispatchService.dispatch<ViewChatsRequest, ViewChatsResponse>(
            req,
          ),
        ),
        map((response: QtisRequestResponse<ViewChatsResponse>) =>
          response.r.flatMap((r: ViewChatsResponse) => r.chats),
        ),
        switchMap((chats: Chat[]) =>
          of({ isLoading: false, isError: false, chats }).pipe(delay(200)),
        ),
        startWith({ isLoading: true, isError: false, chats: undefined }),
      );
  }

  getChatsUpdates$(statuses: MsgChatStatus[]): Observable<ChatVersion[]> {
    return this.msgRequestBuilderService
      .buildUpdateChatListRequest({
        statuses,
      })
      .pipe(
        switchMap((req: QtisRequestResponse<UpdateChatListRequest>) =>
          this.dispatchService.dispatch<
            UpdateChatListRequest,
            UpdateChatListResponse
          >(req),
        ),
        map((response: QtisRequestResponse<UpdateChatListResponse>) =>
          response.r.flatMap((r: UpdateChatListResponse) => r.chats),
        ),
      );
  }

  mapUpdates$(
    objectForView: {
      chats: Chat[] | undefined;
      isLoading: boolean;
      isError: boolean;
    },
    chatUpdates: ChatVersion[],
    selectedChat: Chat | undefined,
  ): Observable<{
    chats: Chat[] | undefined;
    isLoading: boolean;
    isError: boolean;
  }> {
    if (!objectForView.chats) {
      return of(structuredClone(objectForView));
    }
    const chatUpdatesMap = new Map(
      chatUpdates.map((item) => [item.zoid, item.zver]),
    );
    const chatIdsWithChangedZver = objectForView.chats
      .filter((item) => {
        const arrayItem = chatUpdatesMap.get(item.zoid);
        return arrayItem !== undefined && arrayItem !== item.zver;
      })
      .map((item) => item.zoid);
    // set hasUpdates prop if chat version had changed
    objectForView.chats.forEach((item) => {
      if (chatIdsWithChangedZver.includes(item.zoid)) {
        item.hasUpdates = true;
      }
      if (selectedChat && selectedChat.zoid === item.zoid) {
        item.zver = chatUpdatesMap.get(item.zoid) as number;
        item.hasUpdates = false;
      }
    });
    // if selected chat contains has new version -> fetch messages
    if (selectedChat && chatIdsWithChangedZver.includes(selectedChat.zoid)) {
      this.fetchChatMessagesByChatId$.next(selectedChat.zoid);
    }
    return of(structuredClone(objectForView));
  }

  createNewChat$(
    data: CreateChatDialogReturnData,
  ): Observable<QtisRequestResponse<CreateChatResponse>> {
    const params: CreateChatRequest['params'] = {
      subject: data.subject,
      content: data.message,
    };
    if (data.securityLevel !== undefined) {
      params.slvl = +data.securityLevel;
    }
    if (data.scope !== undefined) {
      params.zsid = data.scope;
    }
    return this.msgRequestBuilderService
      .buildCreateChatRequest(params)
      .pipe(
        switchMap((req) =>
          this.dispatchService.dispatch<CreateChatRequest, CreateChatResponse>(
            req,
          ),
        ),
      );
  }

  sendChatMessage$(
    params: SendChatMessageRequest['params'],
  ): Observable<QtisRequestResponse<SendChatMessageResponse>> {
    return this.msgRequestBuilderService
      .buildSendMessageToChatRequest(params)
      .pipe(
        switchMap((request) =>
          this.dispatchService.dispatch<
            SendChatMessageRequest,
            SendChatMessageResponse
          >(request),
        ),
      );
  }

  editChatMessage$(
    params: EditChatMessageRequest['params'],
  ): Observable<QtisRequestResponse<EditChatMessageResponse>> {
    return this.msgRequestBuilderService
      .buildEditMessageRequest(params)
      .pipe(
        switchMap((request) =>
          this.dispatchService.dispatch<
            EditChatMessageRequest,
            EditChatMessageResponse
          >(request),
        ),
      );
  }

  deleteChatMessage$(
    params: DeleteChatMessageRequest['params'],
  ): Observable<QtisRequestResponse<DeleteChatMessageResponse>> {
    return this.msgRequestBuilderService
      .buildDeleteChatMessageRequest(params)
      .pipe(
        switchMap((request) =>
          this.dispatchService.dispatch<
            DeleteChatMessageRequest,
            DeleteChatMessageResponse
          >(request),
        ),
      );
  }

  changeChatStatus$(
    params: ChangeChatStatusRequest['params'],
  ): Observable<number> {
    return this.msgRequestBuilderService
      .buildChangeChatStatusRequest(params)
      .pipe(
        switchMap((request) =>
          this.dispatchService.dispatch<
            ChangeChatStatusRequest,
            ChangeChatStatusResponse
          >(request),
        ),
        map(
          (response: QtisRequestResponse<ChangeChatStatusResponse>) =>
            response.r[0].e,
        ),
      );
  }

  renameChat$(
    params: ChangeChatStatusRequest['params'],
  ): Observable<QtisRequestResponse<ChangeChatStatusResponse>> {
    return this.msgRequestBuilderService
      .buildChangeChatStatusRequest(params)
      .pipe(
        switchMap((req) =>
          this.dispatchService.dispatch<
            ChangeChatStatusRequest,
            ChangeChatStatusResponse
          >(req),
        ),
      );
  }

  deleteChat$(
    params: DeleteChatRequest['params'],
  ): Observable<QtisRequestResponse<DeleteChatResponse>> {
    return this.msgRequestBuilderService
      .buildDeleteChatRequest(params)
      .pipe(
        switchMap((req) =>
          this.dispatchService.dispatch<DeleteChatRequest, DeleteChatResponse>(
            req,
          ),
        ),
      );
  }
}
