/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreloaderComponent } from '@eustrosoft-front/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  catchError,
  filter,
  iif,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  throwError,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FileReaderService } from '@eustrosoft-front/explorer-lib';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { TextPaginatorIntl } from './text-paginator-intl.class';

@Component({
  selector: 'eustrosoft-front-txt-preview',
  standalone: true,
  imports: [
    CommonModule,
    PreloaderComponent,
    TranslateModule,
    MatPaginatorModule,
  ],
  templateUrl: './txt-preview.component.html',
  styleUrl: './txt-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: TextPaginatorIntl,
    },
  ],
})
export class TxtPreviewComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly fileReaderService = inject(FileReaderService);
  private readonly cdRef = inject(ChangeDetectorRef);
  protected readonly pageSizes = [500000] as const;
  private readonly page$ = new BehaviorSubject<PageEvent>({
    pageIndex: 0,
    pageSize: this.pageSizes[0],
    length: 0,
    previousPageIndex: 0,
  });
  @ViewChild('scrollable') protected scrollable!: ElementRef<HTMLPreElement>;

  protected txtLoad$: Observable<{
    isLoading: boolean;
    isError: boolean;
    errorText: string;
    txtSrc: string | undefined;
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
          switchMap((res) =>
            this.fileReaderService.blobToText(res).pipe(
              switchMap((str) =>
                iif(
                  () => typeof str !== 'string',
                  throwError(() => 'EXPLORER.ERRORS.ERROR_PARSING_DATA'),
                  of(str as string),
                ),
              ),
              catchError(() =>
                throwError(() => 'EXPLORER.ERRORS.ERROR_PARSING_DATA'),
              ),
            ),
          ),
          map((res) => {
            return {
              isLoading: false,
              isError: false,
              errorText: '',
              txtSrc: (res as string) ?? undefined,
            };
          }),
          startWith({
            isLoading: true,
            isError: false,
            errorText: '',
            txtSrc: undefined,
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
        txtSrc: undefined,
      });
    }),
    shareReplay(1),
  );

  protected pagination$: Observable<{
    length: number;
    pageSize: number;
    content: string;
  }> = this.page$.asObservable().pipe(
    switchMap((pageEvent) =>
      this.txtLoad$.pipe(
        filter(({ txtSrc }) => typeof txtSrc === 'string'),
        map(({ txtSrc }) => {
          const startIndex = pageEvent.pageIndex * pageEvent.pageSize;
          const endIndex = Math.min(
            startIndex + pageEvent.pageSize,
            txtSrc!.length,
          );
          return {
            length: txtSrc!.length,
            pageSize: pageEvent.pageSize,
            content: txtSrc!.substring(startIndex, endIndex),
          };
        }),
      ),
    ),
  );

  handlePageEvent(event: PageEvent): void {
    this.page$.next(event);
    this.cdRef.detectChanges();
    if (event.pageIndex < event.previousPageIndex!) {
      this.scrollable.nativeElement.scrollTop =
        this.scrollable.nativeElement.scrollHeight;
    } else {
      this.scrollable.nativeElement.scrollTop = 0;
    }
  }
}
