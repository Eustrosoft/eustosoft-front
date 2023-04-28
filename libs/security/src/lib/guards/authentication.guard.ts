import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { delay, Observable, of, switchMap } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  PingResponse,
  QtisRequestResponseInterface,
} from '@eustrosoft-front/core';

export const authenticationGuard = (): Observable<UrlTree | boolean> => {
  const authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  const snackBar: MatSnackBar = inject(MatSnackBar);
  const router: Router = inject(Router);

  return authenticationService.getAuthenticationInfo().pipe(
    switchMap((pingResponse: QtisRequestResponseInterface<PingResponse>) => {
      if (pingResponse.r[0].e !== 0) {
        snackBar.open('Authenticate in order to access this page', 'Close');
        return of(router.createUrlTree(['login'])).pipe(delay(2000));
      }
      authenticationService.isAuthenticated.next(true);
      return of(true);
    })
  );
};
