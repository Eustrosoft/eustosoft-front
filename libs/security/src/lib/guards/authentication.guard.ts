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
    return this.authenticationService.isAuthenticated.pipe(
      switchMap((value: boolean) => {
        if (!value) {
          this.snackBar.open('Authenticate to access this page', 'Close');
          return of(this.router.createUrlTree(['login'])).pipe(delay(2000));
        }
        return of(true);
      })
    );
  }
}
