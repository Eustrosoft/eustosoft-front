import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { AuthenticationService } from '@eustrosoft-front/security';
import { menuItems } from '../../constants/menu-items.contant';
import { MatMenu, MatMenuPanel } from '@angular/material/menu';

@Component({
  selector: 'eustrosoft-front-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent implements AfterViewInit {
  private authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  @ViewChildren(MatMenu) menus!: QueryList<MatMenu>;
  userInfo$ = this.authenticationService.userInfo$.asObservable();
  menuItems = menuItems;
  menuTriggers: MatMenuPanel[] = [];

  ngAfterViewInit(): void {
    this.menuTriggers = this.menus.map((menu) => menu);
  }

  logout() {
    console.log('logout');
  }
}
