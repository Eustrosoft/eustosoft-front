import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { delay, Observable, of, switchMap } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  PingResponse,
  QtisRequestResponseInterface,
} from '@eustrosoft-front/core';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authenticationService.getAuthenticationInfo().pipe(
      switchMap((pingResponse: QtisRequestResponseInterface<PingResponse>) => {
        if (pingResponse.r[0].e !== 0) {
          this.snackBar.open(
            'Authenticate in order to access this page',
            'Close'
          );
          return of(this.router.createUrlTree(['login'])).pipe(delay(2000));
        }
        this.authenticationService.isAuthenticated.next(true);
        return of(true);
      })
    );
  }
}
