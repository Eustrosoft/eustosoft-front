/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  catchError,
  iif,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  throwError,
} from 'rxjs';
import { PreloaderComponent } from '@eustrosoft-front/common-ui';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'eustrosoft-front-pdf-preview',
  standalone: true,
  imports: [
    CommonModule,
    PdfJsViewerModule,
    PreloaderComponent,
    TranslateModule,
  ],
  templateUrl: './pdf-preview.component.html',
  styleUrl: './pdf-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfPreviewComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  protected pdfLoad$: Observable<{
    isLoading: boolean;
    isError: boolean;
    errorText: string;
    pdfSrc: Blob | undefined;
  }> = of(true).pipe(
    switchMap(() => {
      const link = this.router.lastSuccessfulNavigation?.extras?.state?.link;
      return iif(
        () => typeof link !== 'undefined' && link !== null && link !== '',
        of(link).pipe(
          switchMap((link) =>
            this.http
              .get(link, {
                responseType: 'blob',
              })
              .pipe(
                catchError(() =>
                  throwError(() => 'EXPLORER.ERRORS.ERROR_FETCHING_DATA'),
                ),
              ),
          ),
          map((res) => ({
            isLoading: false,
            isError: false,
            errorText: '',
            pdfSrc: res ?? undefined,
          })),
          startWith({
            isLoading: true,
            isError: false,
            errorText: '',
            pdfSrc: undefined,
          }),
        ),
        throwError(() => 'EXPLORER.ERRORS.FILE_LINK_ERROR'),
      );
    }),
    catchError((errorText: string) => {
      return of({
        isLoading: false,
        isError: true,
        errorText,
        pdfSrc: undefined,
      });
    }),
  );
}
