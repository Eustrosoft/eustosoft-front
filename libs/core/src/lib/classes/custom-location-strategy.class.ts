/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import { HashLocationStrategy } from '@angular/common';

@Injectable()
export class CustomLocationStrategy extends HashLocationStrategy {
  override prepareExternalUrl(internal: string): string {
    return `${this.getBaseHref()}#${internal}`;
  }
}
