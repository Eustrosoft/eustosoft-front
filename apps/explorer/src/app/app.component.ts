import { Component, inject, OnInit } from '@angular/core';
import { APP_CONFIG } from '@eustrosoft-front/config';
import { PRECONFIGURED_TRANSLATE_SERVICE } from '@eustrosoft-front/core';
import { combineLatest, map, Observable } from 'rxjs';

@Component({
  selector: 'eustrosoft-front-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public config = inject(APP_CONFIG);
  public translateService = inject(PRECONFIGURED_TRANSLATE_SERVICE);

  public translatedValues!: Observable<{
    title: string;
    appsButtonText: string;
    login: string;
    dispatcher: string;
    appsPage: string;
  }>;

  ngOnInit(): void {
    this.translatedValues = combineLatest([
      this.translateService.get('HEADER.TITLE'),
      this.translateService.get('HEADER.APPS_BUTTON_TEXT'),
      this.translateService.get('HEADER.APPS.LOGIN'),
      this.translateService.get('HEADER.APPS.DISPATCHER'),
      this.translateService.get('HEADER.APPS.ALL_APPS_PAGE'),
    ]).pipe(
      map(([title, appsButtonText, login, dispatcher, appsPage]) => ({
        title,
        appsButtonText,
        login,
        dispatcher,
        appsPage,
      }))
    );
  }
}
