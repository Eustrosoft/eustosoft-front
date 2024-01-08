/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { getHttpStatusCodeName } from '../functions/get-http-status-code-name.function';

export const httpErrorsInterceptorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        // TODO Get rid of any
        /* eslint-disable */
        const body = event.body as any;
        if (Boolean(body) && Array.isArray(body.r) && body.r[0].e !== 0) {
          const statusCode = body.r[0].e;
          const statusCodeName = getHttpStatusCodeName(statusCode as number);
          throw new HttpErrorResponse({
            status: statusCode,
            statusText: statusCodeName,
            error: body.r[0].m,
          });
        }
      }
    }),
    catchError((err: HttpErrorResponse) => throwError(() => err)),
  );
};
