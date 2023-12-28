/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { getHttpStatusCodeName } from '../functions/get-http-status-code-name.function';

@Injectable()
export class HttpErrorsInterceptorInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<object>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          if (
            Boolean(event.body) &&
            Array.isArray(event.body.r) &&
            event.body.r[0].e !== 0
          ) {
            const statusCode = event.body.r[0].e;
            const statusCodeName = getHttpStatusCodeName(statusCode as number);
            throw new HttpErrorResponse({
              status: statusCode,
              statusText: statusCodeName,
              error: event.body.r[0].m,
            });
          }
        }
      }),
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }
}
