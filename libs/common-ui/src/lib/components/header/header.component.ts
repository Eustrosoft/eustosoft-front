/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

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
import { Router } from '@angular/router';
import { AuthenticatedUserInterface } from '@eustrosoft-front/core';

@Component({
  selector: 'eustrosoft-front-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  @Input() appsListTemplate!: TemplateRef<any>;
  @Input() texts!: { title: string; appName: string; appsButtonText: string };
  @Input() loginPath!: any[];

  private loginService: LoginService = inject(LoginService);
  private authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  public config = inject(APP_CONFIG);
  public router = inject(Router);
  public isAuthenticated$!: Observable<boolean>;
  public userInfo$!: Observable<AuthenticatedUserInterface>;

  ngOnInit() {
    this.isAuthenticated$ =
      this.authenticationService.isAuthenticated$.asObservable();
    this.userInfo$ = this.authenticationService.userInfo$.asObservable();
  }

  logout() {
    this.loginService
      .logout()
      .pipe(
        switchMap(() => this.config),
        tap((config) => {
          if (this.loginPath) {
            this.router.navigate(this.loginPath);
          } else {
            window.location.href = config.loginUrl;
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
