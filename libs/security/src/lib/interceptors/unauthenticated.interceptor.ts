import { inject, Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { getHttpStatusCodeName } from '@eustrosoft-front/core';

@Injectable()
export class UnauthenticatedInterceptor implements HttpInterceptor {
  private router = inject(Router);

  intercept(
    request: HttpRequest<object>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          const isBlob = event.body instanceof Blob;
          if (
            !isBlob &&
            event.body &&
            event.body.r &&
            event.body.r.e === HttpStatusCode.Unauthorized
          ) {
            const statusCode = event.body.r.e;
            const statusCodeName = getHttpStatusCodeName(statusCode as number);
            throw new HttpErrorResponse({
              status: statusCode,
              statusText: statusCodeName,
              error: event.body.r.m,
            });
          }
        }
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === HttpStatusCode.Unauthorized) {
          this.router.navigate(['login']);
        }
        return throwError(() => err);
      })
    );
  }
}
