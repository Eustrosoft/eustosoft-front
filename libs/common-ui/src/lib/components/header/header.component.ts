/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChildren,
} from '@angular/core';
import { AuthenticationService } from '@eustrosoft-front/security';
import { APP_CONFIG } from '@eustrosoft-front/config';
import { MatMenu, MatMenuPanel } from '@angular/material/menu';
import { menuItems } from '../../constants/menu-items.contant';
import { BreakpointsService } from '../../services/breakpoints.service';

@Component({
  selector: 'eustrosoft-front-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements AfterViewInit {
  @ViewChildren(MatMenu) menus!: QueryList<MatMenu>;

  @Input() appsListTemplate!: TemplateRef<unknown>;
  @Input() texts!: { title: string; appName: string; appsButtonText: string };
  @Output() sidenavToggleClicked = new EventEmitter<void>();
  @Output() logoutClicked = new EventEmitter<void>();

  private readonly authenticationService = inject(AuthenticationService);
  private readonly breakpointsService = inject(BreakpointsService);

  protected readonly config = inject(APP_CONFIG);
  protected isAuthenticated$ =
    this.authenticationService.isAuthenticated$.asObservable();
  protected userInfo$ = this.authenticationService.userInfo$.asObservable();
  protected isSm = this.breakpointsService.isSm();

  menuItems = menuItems;
  menuTriggers: MatMenuPanel[] = [];

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    this.isSm = this.breakpointsService.isSm();
  }

  ngAfterViewInit(): void {
    this.menuTriggers = this.menus
      .map((menu) => menu)
      .filter((menu) => menu.backdropClass !== 'ignore');
  }

  logout(): void {
    this.logoutClicked.emit();
  }
}
