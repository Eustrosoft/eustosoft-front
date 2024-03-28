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
  shareReplay,
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
import { PingRequest, PingResponse } from '@eustrosoft-front/login-lib';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private dispatchService = inject(DispatchService);
  private samService = inject(SamService);

  isAuthenticated$ = new BehaviorSubject<boolean>(false);
  pingRes$ = this.getPingResponse().pipe(shareReplay(1));
  userInfo$ = this.getAuthenticationInfo().pipe(shareReplay(1));

  private getPingResponse(): Observable<QtisRequestResponse<PingResponse>> {
    return this.dispatchService
      .dispatch<PingRequest, PingResponse>({
        r: [
          {
            s: Subsystems.PING,
            l: SupportedLanguages.EN_US,
          },
        ],
        t: 0,
      })
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => err)));
  }

  private getAuthenticationInfo(): Observable<AuthenticatedUser> {
    return combineLatest([
      this.pingRes$,
      this.samService.getUserId().pipe(map((res) => +res.r[0].data)),
      this.samService.getUserLogin().pipe(map((res) => res.r[0].data)),
      this.samService.getUserLang().pipe(map((res) => res.r[0].data)),
      this.samService.getUserSlvl().pipe(map((res) => res.r[0].data)),
      this.samService.getUserAvailableSlvl().pipe(map((res) => res.r[0].data)),
      this.samService.getUserDefaultScope().pipe(map((res) => res.r[0].data)),
    ]).pipe(
      map(([pingRes, id, login, lang, slvl, availableSlvl, defaultScope]) => ({
        userAvailableSlvl: availableSlvl,
        userLang: lang,
        userLogin: login,
        userId: id,
        userFullName: pingRes.r[0].fullName,
        userSlvl: +slvl,
        userDefaultScope: +defaultScope,
      })),
      catchError((err: HttpErrorResponse) => throwError(() => err)),
    );
  }
}
