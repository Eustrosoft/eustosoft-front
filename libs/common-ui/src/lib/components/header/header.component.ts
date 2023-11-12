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
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChildren,
} from '@angular/core';
import { switchMap, take, tap } from 'rxjs';
import {
  AuthenticationService,
  LoginService,
} from '@eustrosoft-front/security';
import { APP_CONFIG } from '@eustrosoft-front/config';
import { Router } from '@angular/router';
import { XS_SCREEN_RESOLUTION } from '@eustrosoft-front/core';
import { MatMenu, MatMenuPanel } from '@angular/material/menu';
import { menuItems } from '../../constants/menu-items.contant';

@Component({
  selector: 'eustrosoft-front-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, AfterViewInit {
  @Input() appsListTemplate!: TemplateRef<any>;
  @Input() texts!: { title: string; appName: string; appsButtonText: string };
  @Input() loginPath!: any[];
  @Output() sidenavToggleClicked = new EventEmitter<void>();
  @ViewChildren(MatMenu) menus!: QueryList<MatMenu>;

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

  menuItems = menuItems;
  menuTriggers: MatMenuPanel[] = [];

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isXs = window.innerWidth <= this.xsScreenRes;
  }

  ngOnInit(): void {
    this.isXs = window.innerWidth <= this.xsScreenRes;
  }

  ngAfterViewInit(): void {
    this.menuTriggers = this.menus
      .map((menu) => menu)
      .filter((menu) => menu.backdropClass !== 'ignore');
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
