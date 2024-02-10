/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import {
  DispatchService,
  QtisRequestResponse,
  Subsystems,
  SupportedLanguages,
} from '@eustrosoft-front/core';
import { SamService } from './sam.service';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { PingRequest, PingResponse } from '@eustrosoft-front/login-lib';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private dispatchService = inject(DispatchService);
  private samService = inject(SamService);

  isAuthenticated$ = new BehaviorSubject<boolean>(false);
  userInfo$ = new BehaviorSubject<AuthenticatedUser>({
    userAvailableSlvl: '',
    userLang: '',
    userLogin: '',
    userId: -1,
    userSlvl: '',
    userFullName: '',
  });

  getAuthenticationInfo(): Observable<QtisRequestResponse<PingResponse>> {
    return combineLatest([
      this.dispatchService.dispatch<PingRequest, PingResponse>({
        r: [
          {
            s: Subsystems.PING,
            l: SupportedLanguages.EN_US,
          },
        ],
        t: 0,
      } as QtisRequestResponse<PingRequest>),
      this.samService.getUserId().pipe(map((res) => +res.r[0].data)),
      this.samService.getUserLogin().pipe(map((res) => res.r[0].data)),
      this.samService.getUserLang().pipe(map((res) => res.r[0].data)),
      this.samService.getUserSlvl().pipe(map((res) => res.r[0].data)),
      this.samService.getUserAvailableSlvl().pipe(map((res) => res.r[0].data)),
    ]).pipe(
      tap(([pingRes, id, login, lang, slvl, availableSlvl]) =>
        this.userInfo$.next({
          userAvailableSlvl: availableSlvl,
          userLang: lang,
          userLogin: login,
          userId: id,
          userFullName: pingRes.r[0].fullName,
          userSlvl: slvl,
        }),
      ),
      switchMap(([pingRes]) => of(pingRes)),
      catchError((err: HttpErrorResponse) => throwError(() => err)),
    );
  }
}
