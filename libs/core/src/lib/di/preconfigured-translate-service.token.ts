/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { InjectionToken } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const PRECONFIGURED_TRANSLATE_SERVICE =
  new InjectionToken<TranslateService>(
    'Translate service with some predefined values (defaultLanguage and so on)',
  );
