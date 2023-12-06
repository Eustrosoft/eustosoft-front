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
import { MatMenu, MatMenuPanel } from '@angular/material/menu';

@Component({
  selector: 'eustrosoft-front-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent implements AfterViewInit {
  @ViewChildren(MatMenu) menus!: QueryList<MatMenu>;

  @Output() logoutClicked = new EventEmitter<void>();

  private readonly authenticationService: AuthenticationService = inject(
    AuthenticationService
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
