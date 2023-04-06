import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  TemplateRef,
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
  @Input() appsListTemplate!: TemplateRef<any>;
  @Input() localizedTexts!: { title: string; appsButtonText: string };

  private loginService: LoginService = inject(LoginService);
  private authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  public environment = inject(APP_ENVIRONMENT);
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
        take(1),
        tap(() => {
          window.location.href = this.environment.loginUrl;
        })
      )
      .subscribe();
  }
}
