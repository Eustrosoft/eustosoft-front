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

@NgModule({
  declarations: [FormControlPipe, FormArrayPipe, ToNumberPipe],
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
        const langRegex = `/${languages.join('|')}/`;
        if (browserLang) {
          translateService.use(
            browserLang.match(langRegex)
              ? browserLang
              : SupportedLanguages.EN_US
          );
        } else {
          translateService.use(SupportedLanguages.EN_US);
        }
        console.log('Supported Languages:', translateService.getLangs());

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
  exports: [FormControlPipe, FormArrayPipe, ToNumberPipe, TranslateModule],
})
export class CoreModule {}
