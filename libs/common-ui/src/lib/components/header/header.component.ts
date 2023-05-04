import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { Observable, switchMap, take, tap } from 'rxjs';
import {
  AuthenticationService,
  LoginService,
} from '@eustrosoft-front/security';
import { APP_CONFIG } from '@eustrosoft-front/config';

@Component({
  selector: 'eustrosoft-front-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  @Input() appsListTemplate!: TemplateRef<any>;
  @Input() texts!: { title: string; appsButtonText: string };

  private loginService: LoginService = inject(LoginService);
  private authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  public config = inject(APP_CONFIG);
  public isAuthenticated!: Observable<boolean>;
  public userName!: Observable<string>;

  ngOnInit() {
    this.isAuthenticated =
      this.authenticationService.isAuthenticated.asObservable();
    this.userName = this.authenticationService.userName.asObservable();
  }

  logout() {
    this.loginService
      .logout()
      .pipe(
        switchMap(() => this.config),
        tap((config) => {
          window.location.href = config.loginUrl;
        }),
        take(1)
      )
      .subscribe();
  }
}
