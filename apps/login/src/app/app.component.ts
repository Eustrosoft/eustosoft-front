import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { APP_ENVIRONMENT } from '@eustrosoft-front/app-config';

@Component({
  selector: 'eustrosoft-front-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  public environment = inject(APP_ENVIRONMENT);
  public headerLocalizedTexts = {
    title: $localize`LOGO | TIS Apps | Login`,
    appsButtonText: $localize`Apps`,
  };
  public localizedAppsListNames = {
    explorer: $localize`Explorer`,
    dispatcher: $localize`Dispatcher`,
    appsPage: $localize`All apps page`,
  };
}
