/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TextPaginatorIntl implements MatPaginatorIntl {
  private translateService = inject(TranslateService);

  changes = new Subject<void>();

  firstPageLabel = this.translateService.instant(
    'EXPLORER.TXT_PREVIEW_PAGINATOR.FIRST_PAGE',
  );
  itemsPerPageLabel = this.translateService.instant(
    'EXPLORER.TXT_PREVIEW_PAGINATOR.ITEMS_PER_PAGE',
  );
  lastPageLabel = this.translateService.instant(
    'EXPLORER.TXT_PREVIEW_PAGINATOR.LAST_PAGE',
  );

  nextPageLabel = this.translateService.instant(
    'EXPLORER.TXT_PREVIEW_PAGINATOR.NEXT_PAGE',
  );
  previousPageLabel = this.translateService.instant(
    'EXPLORER.TXT_PREVIEW_PAGINATOR.PREVIOUS_PAGE',
  );

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return this.translateService.instant(
        'EXPLORER.TXT_PREVIEW_PAGINATOR.ONE_OF_ONE',
      );
    }
    const amountPages = Math.ceil(length / pageSize);
    return this.translateService.instant(
      'EXPLORER.TXT_PREVIEW_PAGINATOR.PAGE_OF_AMOUNT',
      {
        page: page + 1,
        amountPages: amountPages,
      },
    );
  }
}
