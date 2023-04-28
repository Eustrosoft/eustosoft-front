import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { APP_CONFIG } from '@eustrosoft-front/config';

@Component({
  selector: 'eustrosoft-front-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  public config = inject(APP_CONFIG);
  public headerLocalizedTexts = {
    title: `LOGO | TIS Apps | Login`,
    appsButtonText: `Apps`,
  };
  public localizedAppsListNames = {
    explorer: `Explorer`,
    dispatcher: `Dispatcher`,
    appsPage: `All apps page`,
  };
}
