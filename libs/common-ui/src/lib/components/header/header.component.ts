import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import {
  AuthenticationService,
  LoginService,
} from '@eustrosoft-front/security';
import { APP_ENVIRONMENT } from '@eustrosoft-front/app-config';

@Component({
  selector: 'eustrosoft-front-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  constructor(
    private loginService: LoginService,
    private authenticationService: AuthenticationService
  ) {}

  private appEnv = inject(APP_ENVIRONMENT);
  isAuthenticated: Observable<boolean> | undefined;

  ngOnInit() {
    this.isAuthenticated =
      this.authenticationService.isAuthenticated.asObservable();
  }

  logout() {
    this.loginService
      .logout()
      .pipe(
        take(1),
        tap(() => {
          window.location.href = this.appEnv.loginUrl;
        })
      )
      .subscribe();
  }
}
