/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { DispatchService } from '../services/DispatchService';
import { SubsystemsEnum } from '../constants/enums/subsystems.enum';
import { AuthActionsEnum } from '../constants/enums/auth-actions.enum';
import { SupportedLanguagesEnum } from '../constants/enums/supported-languages.enum';
import { AuthLoginLogoutResponse } from '../core/interfaces/auth/auth-login-logout-response.interface';
import { AuthLogoutRequest } from '../core/interfaces/auth/auth-logout-request.interface';
import { PingRequest } from '../core/interfaces/auth/ping-request.interface';
import { PingResponse } from '../core/interfaces/auth/ping-response.interface';
import { requestFactoryFunction } from '../utils/request-factory.function';
import { AuthLoginRequest } from '../core/interfaces/auth/auth-login-request.interface';
import { RequestFactoryInterface } from '../core/interfaces/request-factory.interface';

export class QSystem {
  private dispatchService: DispatchService;

  constructor(
    dispatchService: DispatchService = DispatchService.getInstance(),
  ) {
    this.dispatchService = dispatchService;
  }

  login(
    login: string,
    password: string,
  ): RequestFactoryInterface<AuthLoginLogoutResponse> {
    return requestFactoryFunction<AuthLoginRequest, AuthLoginLogoutResponse>({
      r: [
        {
          s: SubsystemsEnum.LOGIN,
          r: AuthActionsEnum.LOGIN,
          l: SupportedLanguagesEnum.EN_US,
          login,
          password,
        },
      ],
      t: 0,
    });
  }

  logout(): RequestFactoryInterface<AuthLoginLogoutResponse> {
    return requestFactoryFunction<AuthLogoutRequest, AuthLoginLogoutResponse>({
      r: [
        {
          s: SubsystemsEnum.LOGIN,
          r: AuthActionsEnum.LOGOUT,
          l: SupportedLanguagesEnum.EN_US,
        },
      ],
      t: 0,
    });
  }

  ping(): RequestFactoryInterface<PingResponse> {
    return requestFactoryFunction<PingRequest, PingResponse>({
      r: [
        {
          s: SubsystemsEnum.PING,
          l: SupportedLanguagesEnum.EN_US,
        },
      ],
      t: 0,
    });
  }
}
