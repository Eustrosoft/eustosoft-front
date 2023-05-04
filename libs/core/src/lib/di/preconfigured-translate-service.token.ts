import { InjectionToken } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const PRECONFIGURED_TRANSLATE_SERVICE =
  new InjectionToken<TranslateService>(
    'Translate service with some predefined values (defaultLanguage and so on)'
  );
