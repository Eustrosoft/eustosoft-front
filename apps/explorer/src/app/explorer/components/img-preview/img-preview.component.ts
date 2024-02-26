/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { PreloaderComponent } from '@eustrosoft-front/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import {
  catchError,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  throwError,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ImgFileExtensions } from '@eustrosoft-front/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'eustrosoft-front-img-preview',
  standalone: true,
  imports: [
    CommonModule,
    PdfJsViewerModule,
    PreloaderComponent,
    TranslateModule,
  ],
  templateUrl: './img-preview.component.html',
  styleUrl: './img-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImgPreviewComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly domSanitizer = inject(DomSanitizer);
  protected readonly ImgFileExtensions = ImgFileExtensions;
  protected imgLoad$: Observable<{
    isLoading: boolean;
    isError: boolean;
    errorText: string;
    src: string | SafeHtml | undefined;
    ext: string | undefined;
  }> = of(true).pipe(
    switchMap(() => {
      const link = this.router.lastSuccessfulNavigation?.extras?.state?.link;
      const ext =
        this.router.lastSuccessfulNavigation?.extras?.state?.extension;
      if (typeof link === 'undefined' || link === null || link === '') {
        return throwError(() => 'EXPLORER.ERRORS.FILE_LINK_ERROR');
      }
      if (typeof ext === 'undefined' || ext === null || ext === '') {
        return throwError(() => 'EXPLORER.ERRORS.FILE_EXT_ERROR');
      }

      const responseType = ext === ImgFileExtensions.Svg ? 'text' : 'blob';
      return of(link).pipe(
        switchMap((link) => {
          switch (responseType) {
            case 'blob':
              return this.http.get(link, { responseType }).pipe(
                map((res) => ({
                  isLoading: false,
                  isError: false,
                  errorText: '',
                  src: URL.createObjectURL(res) ?? undefined,
                  ext,
                })),
                catchError(() =>
                  throwError(() => 'EXPLORER.ERRORS.ERROR_FETCHING_DATA'),
                ),
              );
            case 'text':
              return this.http.get(link, { responseType }).pipe(
                map((res) => ({
                  isLoading: false,
                  isError: false,
                  errorText: '',
                  src:
                    this.domSanitizer.bypassSecurityTrustHtml(res) ?? undefined,
                  ext,
                })),
                catchError(() =>
                  throwError(() => 'EXPLORER.ERRORS.ERROR_FETCHING_DATA'),
                ),
              );
          }
        }),
        startWith({
          isLoading: true,
          isError: false,
          errorText: '',
          src: undefined,
          ext: undefined,
        }),
      );
    }),
    catchError((errorText: string) => {
      return of({
        isLoading: false,
        isError: true,
        errorText,
        src: undefined,
        ext: undefined,
      });
    }),
  );
}
