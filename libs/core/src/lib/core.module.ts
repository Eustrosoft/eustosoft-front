/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlPipe } from './pipes/form-control.pipe';
import { FormArrayPipe } from './pipes/form-array.pipe';
import { FileReaderService } from './services/file-reader.service';
import { ToNumberPipe } from './pipes/to-number.pipe';
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

@NgModule({
  declarations: [FormControlPipe, FormArrayPipe, ToNumberPipe, BytesToSizePipe],
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

        if (browserLang) {
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
          if (closestCode) {
            translateService.use(closestCode);
          } else {
            translateService.use(SupportedLanguages.EN_US);
          }
        } else {
          translateService.use(SupportedLanguages.EN_US);
        }
        console.log('Supported Languages:', translateService.getLangs());
        console.log('Current Language:', translateService.currentLang);
        return translateService;
      },
      deps: [TranslateService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorsInterceptorInterceptor,
      multi: true,
    },
  ],
  exports: [
    FormControlPipe,
    FormArrayPipe,
    ToNumberPipe,
    BytesToSizePipe,
    TranslateModule,
  ],
})
export class CoreModule {}
