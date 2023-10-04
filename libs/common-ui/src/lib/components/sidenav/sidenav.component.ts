import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthenticationService } from '@eustrosoft-front/security';

@Component({
  selector: 'eustrosoft-front-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent {
  private authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  public userInfo$ = this.authenticationService.userInfo$.asObservable();

  logout() {
    console.log('logout');
  }
}
