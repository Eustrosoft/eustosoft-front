/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import { AuthenticationService } from '@eustrosoft-front/security';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { APP_CONFIG } from '@eustrosoft-front/config';
import { catchError, EMPTY, map, startWith } from 'rxjs';
import { ReplaceOriginPipe } from '@eustrosoft-front/core';

@Component({
  selector: 'eustrosoft-front-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    NgClass,
    MatIconModule,
    NgFor,
    MatMenuModule,
    AsyncPipe,
    TranslateModule,
    ReplaceOriginPipe,
  ],
})
export class SidenavComponent {
  private readonly config = inject(APP_CONFIG);
  private readonly authenticationService: AuthenticationService = inject(
    AuthenticationService,
  );

  @Output() protected logoutClicked = new EventEmitter<void>();
  @Output() protected sidenavToggleClicked = new EventEmitter<void>();

  protected readonly userInfo$ = this.authenticationService.userInfo$.pipe(
    catchError(() => EMPTY),
  );
  protected readonly menuItems$ = this.config.pipe(
    map((cnf) => cnf.sideNavMenuItems),
    startWith({
      dropdowns: [],
      rest: [],
    }),
  );

  logout(): void {
    this.logoutClicked.emit();
  }
}
