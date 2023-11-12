/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import {
  catchError,
  delay,
  map,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import {
  ChatMessage,
  QtisRequestResponseInterface,
  ViewChatRequest,
  ViewChatResponse,
} from '@eustrosoft-front/core';
import { DispatchService } from '@eustrosoft-front/security';
import { MsgRequestBuilderService } from './msg-request-builder.service';

@Injectable()
export class MsgMapperService {
  private dispatchService = inject(DispatchService);
  private msgRequestBuilderService = inject(MsgRequestBuilderService);
  fetchChatMessagesWithPreloader(zoid: number): Observable<{
    isLoading: boolean;
    isError: boolean;
    messages: ChatMessage[] | undefined;
  }> {
    return this.msgRequestBuilderService.buildViewChatRequest(zoid).pipe(
      switchMap((req: QtisRequestResponseInterface<ViewChatRequest>) =>
        this.dispatchService
          .dispatch<ViewChatRequest, ViewChatResponse>(req)
          .pipe(
            map((response: QtisRequestResponseInterface<ViewChatResponse>) =>
              response.r.flatMap((r: ViewChatResponse) => r.messages)
            ),
            switchMap((messages: ChatMessage[]) =>
              of({ isLoading: false, isError: false, messages }).pipe(
                delay(200)
              )
            ),
            startWith({ isLoading: true, isError: false, messages: undefined }),
            catchError(() =>
              of({ isLoading: false, isError: true, messages: undefined })
            )
          )
      )
    );
  }

  fetchChatMessagesWithoutPreloader(zoid: number): Observable<{
    isLoading: boolean;
    isError: boolean;
    messages: ChatMessage[] | undefined;
  }> {
    return this.msgRequestBuilderService.buildViewChatRequest(zoid).pipe(
      switchMap((req: QtisRequestResponseInterface<ViewChatRequest>) =>
        this.dispatchService
          .dispatch<ViewChatRequest, ViewChatResponse>(req)
          .pipe(
            map((response: QtisRequestResponseInterface<ViewChatResponse>) =>
              response.r.flatMap((r: ViewChatResponse) => r.messages)
            ),
            switchMap((messages: ChatMessage[]) =>
              of({ isLoading: false, isError: false, messages })
            ),
            catchError(() =>
              of({ isLoading: false, isError: true, messages: undefined })
            )
          )
      )
    );
  }
}
