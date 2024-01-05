/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlPipe } from './pipes/form-control.pipe';
import { FormArrayPipe } from './pipes/form-array.pipe';
import { FileReaderService } from './services/file-reader.service';
import { ConfigModule } from '@eustrosoft-front/config';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpErrorsInterceptorInterceptor } from './interceptors/http-errors-interceptor.interceptor';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { HttpLoaderFactory } from './functions/i18n-http-loader.function';
import { SupportedLanguages } from './constants/enums/supported-languages.enum';
import { PRECONFIGURED_TRANSLATE_SERVICE } from './di/preconfigured-translate-service.token';
import { BytesToSizePipe } from './pipes/bytes-to-size.pipe';
import { initializeLocales } from './functions/locale-initializer.function';
import { SM_SCREEN_RESOLUTION } from './di/extra-small-screen-resolution.token';

@NgModule({
  declarations: [FormControlPipe, FormArrayPipe, BytesToSizePipe],
  imports: [
    CommonModule,
    ConfigModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    FileReaderService,
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
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorsInterceptorInterceptor,
      multi: true,
    },
    {
      provide: SM_SCREEN_RESOLUTION,
      useValue: 576,
    },
  ],
  exports: [FormControlPipe, FormArrayPipe, BytesToSizePipe, TranslateModule],
})
export class CoreModule {}
