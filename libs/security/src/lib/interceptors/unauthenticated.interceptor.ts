/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { getHttpStatusCodeName } from '@eustrosoft-front/core';

export const unauthenticatedInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const router = inject(Router);
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const isBlob = event.body instanceof Blob;
        // TODO Get rid of any
        /* eslint-disable */
        const body = event.body as any;
        if (
          !isBlob &&
          Boolean(body) &&
          Boolean(body.r) &&
          body.r.e === HttpStatusCode.Unauthorized
        ) {
          const statusCode = body.r.e;
          const statusCodeName = getHttpStatusCodeName(statusCode as number);
          throw new HttpErrorResponse({
            status: statusCode,
            statusText: statusCodeName,
            error: body.r.m,
          });
        }
      }
    }),
    catchError((err: HttpErrorResponse) => {
      if (err.status === HttpStatusCode.Unauthorized) {
        router.navigate(['login']);
      }
      return throwError(() => err);
    }),
  );
};
