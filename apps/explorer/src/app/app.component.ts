import { Component, inject } from '@angular/core';
import { APP_ENVIRONMENT } from '@eustrosoft-front/app-config';

@Component({
  selector: 'eustrosoft-front-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public environment = inject(APP_ENVIRONMENT);
  public headerLocalizedTexts = {
    title: `LOGO | TIS Apps | Explorer`,
    appsButtonText: `Apps`,
  };
  public localizedAppsListNames = {
    login: `Login`,
    dispatcher: `Dispatcher`,
    appsPage: `All apps page`,
  };
}
