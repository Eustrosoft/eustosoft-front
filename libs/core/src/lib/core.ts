/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { APP_INITIALIZER, LOCALE_ID, Provider } from '@angular/core';
import { PRECONFIGURED_TRANSLATE_SERVICE } from './di/preconfigured-translate-service.token';
import { SM_SCREEN_RESOLUTION } from './di/small-screen-resolution.token';
import { SupportedLanguages } from './constants/enums/supported-languages.enum';
import { TranslateService } from '@ngx-translate/core';
import { initializeLocales } from './functions/locale-initializer.function';

export function provideCoreLib(): Provider[] {
  return [
    {
      provide: PRECONFIGURED_TRANSLATE_SERVICE,
      useFactory: (translateService: TranslateService): TranslateService => {
        const languages: SupportedLanguages[] =
          Object.values(SupportedLanguages);
        translateService.addLangs(languages);
        translateService.setDefaultLang(SupportedLanguages.EN_US);
        const browserLang = translateService.getBrowserCultureLang();
        if (browserLang !== undefined) {
          let closestCode: string | undefined = undefined;
          let maxMatches = 0;
          for (const lang of languages) {
            const matches: number = lang.startsWith(browserLang)
              ? lang.split('-').length
              : 0;
            if (matches > maxMatches) {
              closestCode = lang;
              maxMatches = matches;
            }
          }
          if (closestCode !== undefined) {
            translateService.use(closestCode);
          } else {
            translateService.use(SupportedLanguages.EN_US);
          }
        } else {
          translateService.use(SupportedLanguages.EN_US);
        }
        console.warn('Supported Languages:', translateService.getLangs());
        console.warn('Current Language:', translateService.currentLang);
        return translateService;
      },
      deps: [TranslateService],
    },
    {
      provide: LOCALE_ID,
      useFactory: (translateService: TranslateService) =>
        translateService.getBrowserCultureLang(),
      deps: [TranslateService],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => initializeLocales,
      multi: true,
    },
    {
      provide: SM_SCREEN_RESOLUTION,
      useValue: 576,
    },
  ];
}
