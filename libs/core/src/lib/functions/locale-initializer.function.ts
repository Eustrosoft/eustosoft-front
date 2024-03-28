/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */
import localeRu from '@angular/common/locales/ru';
import localeEn from '@angular/common/locales/en';
import { registerLocaleData } from '@angular/common';

export async function initializeLocales(): Promise<void> {
  registerLocaleData(localeRu);
  registerLocaleData(localeEn);
}
