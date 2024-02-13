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
import { RequestFactory } from '../core/interfaces/request-factory.interface';
import { FsViewResponse } from '../core/interfaces/fs/fs-view-response.interface';
import { FsViewRequest } from '../core/interfaces/fs/fs-view-request.interface';
import { FsActionsEnum } from '../constants/enums/fs-actions.enum';

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
  ): RequestFactory<AuthLoginLogoutResponse> {
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

  logout(): RequestFactory<AuthLoginLogoutResponse> {
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

  ping(): RequestFactory<PingResponse> {
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

  listFs(path: string = '/'): RequestFactory<FsViewResponse> {
    return requestFactoryFunction<FsViewRequest, FsViewResponse>({
      r: [
        {
          s: SubsystemsEnum.CMS,
          r: FsActionsEnum.VIEW,
          l: SupportedLanguagesEnum.EN_US,
          path,
        },
      ],
      t: 0,
    });
  }
}
