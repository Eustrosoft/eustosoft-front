import { Component, inject } from '@angular/core';
import { APP_CONFIG } from '@eustrosoft-front/config';

@Component({
  selector: 'eustrosoft-front-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public config = inject(APP_CONFIG);
  public headerLocalizedTexts = {
    title: `LOGO | TIS Apps | Dispatcher`,
    appsButtonText: `Apps`,
  };
  public localizedAppsListNames = {
    login: `Login`,
    explorer: `Explorer`,
    appsPage: `All apps page`,
  };
}
