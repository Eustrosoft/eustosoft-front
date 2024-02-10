/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  AuthenticationService,
  LoginService,
} from '@eustrosoft-front/security';
import { PRECONFIGURED_TRANSLATE_SERVICE } from '@eustrosoft-front/core';
import { APP_CONFIG } from '@eustrosoft-front/config';
import { take, tap } from 'rxjs';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { HeaderComponent, SidenavComponent } from '@eustrosoft-front/common-ui';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    AsyncPipe,
    HeaderComponent,
    MatMenuModule,
    MatSidenavModule,
    NgForOf,
    NgIf,
    SidenavComponent,
    TranslateModule,
  ],
  selector: 'eustrosoft-front-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TranslateService],
})
export class AppComponent {
  private readonly loginService = inject(LoginService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);
  // PRECONFIGURED_TRANSLATE_SERVICE token must be injected. Otherwise, useFactory won't run
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
        take(1),
      )
      .subscribe();
  }
}
