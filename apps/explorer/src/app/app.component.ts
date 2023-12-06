/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Component, inject } from '@angular/core';
import { APP_CONFIG } from '@eustrosoft-front/config';
import { PRECONFIGURED_TRANSLATE_SERVICE } from '@eustrosoft-front/core';
import { take, tap } from 'rxjs';
import {
  AuthenticationService,
  LoginService,
} from '@eustrosoft-front/security';
import { Router } from '@angular/router';

@Component({
  selector: 'eustrosoft-front-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly loginService = inject(LoginService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly translateService = inject(PRECONFIGURED_TRANSLATE_SERVICE);
  protected readonly config = inject(APP_CONFIG);
  protected isAuthenticated$ =
    this.authenticationService.isAuthenticated$.asObservable();

  logout(): void {
    this.loginService
      .logout()
      .pipe(
        tap(() => {
          this.router.navigate(['login']);
        }),
        take(1)
      )
      .subscribe();
  }
}
