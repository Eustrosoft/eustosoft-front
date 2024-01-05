import { inject, Injectable } from '@angular/core';
import {
  DispatchService,
  QtisRequestResponseInterface,
  SamRequestActions,
  Scopes,
  Subsystems,
  SupportedLanguages,
  UserAvailableScopesRequest,
  UserAvailableScopesResponse,
  UserAvailableSlvlRequest,
  UserAvailableSlvlResponse,
  UserIdRequest,
  UserIdResponse,
  UserLangRequest,
  UserLangResponse,
  UserLoginRequest,
  UserLoginResponse,
  UserSlvlRequest,
  UserSlvlResponse,
} from '@eustrosoft-front/core';
import { Observable } from 'rxjs';

@Injectable()
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
