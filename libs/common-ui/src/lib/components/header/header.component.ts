/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import { switchMap, take, tap } from 'rxjs';
import {
  AuthenticationService,
  LoginService,
} from '@eustrosoft-front/security';
import { APP_CONFIG } from '@eustrosoft-front/config';
import { Router } from '@angular/router';
import { XS_SCREEN_RESOLUTION } from '@eustrosoft-front/core';

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
  @Output() sidenavToggleClicked = new EventEmitter<void>();

  private loginService: LoginService = inject(LoginService);
  private authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  private xsScreenRes = inject(XS_SCREEN_RESOLUTION);
  public config = inject(APP_CONFIG);
  public router = inject(Router);
  public isAuthenticated$ =
    this.authenticationService.isAuthenticated$.asObservable();
  public userInfo$ = this.authenticationService.userInfo$.asObservable();
  public isXs = false;

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isXs = window.innerWidth <= this.xsScreenRes;
  }

  ngOnInit(): void {
    this.isXs = window.innerWidth <= this.xsScreenRes;
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
