/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import {
  DispatchService,
  QtisRequestResponseInterface,
  Subsystems,
  SupportedLanguages,
} from '@eustrosoft-front/core';
import { Observable } from 'rxjs';
import {
  UserAvailableScopesRequest,
  UserAvailableSlvlRequest,
  UserIdRequest,
  UserLangRequest,
  UserLoginRequest,
  UserSlvlRequest,
} from '../interfaces/sam-request.interface';
import {
  UserAvailableScopesResponse,
  UserAvailableSlvlResponse,
  UserIdResponse,
  UserLangResponse,
  UserLoginResponse,
  UserSlvlResponse,
} from '../interfaces/sam-response.interface';
import { SamRequestActions } from '../constants/enums/sam-actions.enum';
import { Scopes } from '../constants/enums/scopes.enum';

@Injectable({ providedIn: 'root' })
export class SamService {
  private dispatchService = inject(DispatchService);

  getUserId(): Observable<QtisRequestResponseInterface<UserIdResponse>> {
    return this.dispatchService.dispatch<UserIdRequest, UserIdResponse>({
      r: [
        {
          s: Subsystems.SAM,
          r: SamRequestActions.USER_ID,
          l: SupportedLanguages.EN_US,
        },
      ],
      t: 0,
    });
  }

  getUserLogin(): Observable<QtisRequestResponseInterface<UserLoginResponse>> {
    return this.dispatchService.dispatch<UserLoginRequest, UserLoginResponse>({
      r: [
        {
          s: Subsystems.SAM,
          r: SamRequestActions.USER_LOGIN,
          l: SupportedLanguages.EN_US,
        },
      ],
      t: 0,
    });
  }

  getUserLang(): Observable<QtisRequestResponseInterface<UserLangResponse>> {
    return this.dispatchService.dispatch<UserLangRequest, UserLangResponse>({
      r: [
        {
          s: Subsystems.SAM,
          r: SamRequestActions.USER_LANG,
          l: SupportedLanguages.EN_US,
        },
      ],
      t: 0,
    });
  }

  getUserSlvl(): Observable<QtisRequestResponseInterface<UserSlvlResponse>> {
    return this.dispatchService.dispatch<UserSlvlRequest, UserSlvlResponse>({
      r: [
        {
          s: Subsystems.SAM,
          r: SamRequestActions.USER_SLVL,
          l: SupportedLanguages.EN_US,
        },
      ],
      t: 0,
    });
  }

  getUserAvailableSlvl(): Observable<
    QtisRequestResponseInterface<UserAvailableSlvlResponse>
  > {
    return this.dispatchService.dispatch<
      UserAvailableSlvlRequest,
      UserAvailableSlvlResponse
    >({
      r: [
        {
          s: Subsystems.SAM,
          r: SamRequestActions.USER_AVAILABLE_SLVL,
          l: SupportedLanguages.EN_US,
        },
      ],
      t: 0,
    });
  }

  getUserAvailableScope(
    type: Scopes,
  ): Observable<QtisRequestResponseInterface<UserAvailableScopesResponse>> {
    return this.dispatchService.dispatch<
      UserAvailableScopesRequest,
      UserAvailableScopesResponse
    >({
      r: [
        {
          s: Subsystems.SAM,
          r: SamRequestActions.USER_AVAILABLE_SCOPE,
          l: SupportedLanguages.EN_US,
          type,
        },
      ],
      t: 0,
    });
  }
}
