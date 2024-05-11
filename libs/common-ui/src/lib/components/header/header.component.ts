/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { AuthenticationService } from '@eustrosoft-front/security';
import { APP_CONFIG } from '@eustrosoft-front/config';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointsService } from '../../services/breakpoints.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'eustrosoft-front-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatToolbarModule,
    NgIf,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    NgFor,
    AsyncPipe,
  ],
})
export class HeaderComponent {
  @Input() appsListTemplate!: TemplateRef<unknown>;
  @Input() texts!: { title: string; appName: string; appsButtonText: string };
  @Output() sidenavToggleClicked = new EventEmitter<void>();
  @Output() logoutClicked = new EventEmitter<void>();

  private readonly authenticationService = inject(AuthenticationService);
  private readonly breakpointsService = inject(BreakpointsService);

  protected readonly config = inject(APP_CONFIG);
  protected isAuthenticated$ =
    this.authenticationService.isAuthenticated$.asObservable();
  protected userInfo$ = this.authenticationService.userInfo$;
  protected isSm = toSignal(this.breakpointsService.isSm(), {
    requireSync: true,
  });

  logout(): void {
    this.logoutClicked.emit();
  }
}
