/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { AuthenticationService } from '@eustrosoft-front/security';
import { menuItems } from '../../constants/menu-items.contant';
import { MatMenu, MatMenuPanel, MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, NgClass, NgFor, AsyncPipe } from '@angular/common';

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
  ],
})
export class SidenavComponent implements AfterViewInit {
  @ViewChildren(MatMenu) menus!: QueryList<MatMenu>;

  @Output() logoutClicked = new EventEmitter<void>();

  private readonly authenticationService: AuthenticationService = inject(
    AuthenticationService,
  );
  protected readonly userInfo$ =
    this.authenticationService.userInfo$.asObservable();
  protected readonly menuItems = menuItems;
  protected menuTriggers: MatMenuPanel[] = [];

  ngAfterViewInit(): void {
    this.menuTriggers = this.menus.map((menu) => menu);
  }

  logout(): void {
    this.logoutClicked.emit();
  }
}
