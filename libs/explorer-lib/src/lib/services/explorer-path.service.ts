/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable, Signal, signal } from '@angular/core';
import { AuthenticationService } from '@eustrosoft-front/security';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import {
  DispatchService,
  DocumentFileExtensions,
  ImgFileExtensions,
  PRECONFIGURED_TRANSLATE_SERVICE,
  QtisRequestResponse,
  Subsystems,
  TextFileExtensions,
} from '@eustrosoft-front/core';
import { ExplorerRequestActions } from '../constants/enums/explorer-actions.enum';
import { FileSystemObject } from '../interfaces/file-system-object.interface';
import { DOCUMENT } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  catchError,
  combineLatest,
  EMPTY,
  finalize,
  iif,
  map,
  Observable,
  of,
  repeat,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { ViewRequest } from '../interfaces/explorer-request.interface';
import { ViewResponse } from '../interfaces/explorer-response.interface';
import { ExplorerRoutes } from '../constants/enums/explorer-routes.enum';
import { ExplorerFsObjectTypes } from '../constants/enums/explorer-fs-object-types.enum';
import { ExplorerRequestBuilderService } from './explorer-request-builder.service';
import { CachedDictionaryService } from '@eustrosoft-front/dic';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ExplorerPathService {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly document = inject(DOCUMENT);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dispatchService = inject(DispatchService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly cachedDictionaryService = inject(CachedDictionaryService);
  private readonly translateService = inject(PRECONFIGURED_TRANSLATE_SERVICE);
  private readonly explorerRequestBuilderService = inject(
    ExplorerRequestBuilderService,
  );
  private readonly lastPathStorageKey = 'qtis-explorer-last-path-';

  private readonly userId = toSignal(
    this.authenticationService.userInfo$.pipe(
      map((userInfo) => userInfo.userId),
    ),
    { requireSync: true },
  );
  private readonly pathSignal = signal<string>(this.getLastPathState());

  setPath(path: string): void {
    this.pathSignal.set(path);
  }

  getPath(): Signal<string> {
    return this.pathSignal.asReadonly();
  }

  private readonly pathSignalObs$ = toObservable<string>(this.pathSignal);

  private readonly fetchSignal = signal<null>(null);

  refreshCurrentPath(): void {
    this.fetchSignal.set(null);
  }

  private readonly fetchSignalObs$ = toObservable<null>(this.fetchSignal);

  getContents$(): Observable<{
    isLoading: boolean;
    isError: boolean;
    content: FileSystemObject[] | undefined;
  }> {
    return combineLatest([
      this.pathSignalObs$.pipe(
        tap(() => {
          console.log(123, 123);
        }),
        switchMap((pathFromSignal) =>
          this.activatedRoute.queryParamMap.pipe(
            switchMap((queryParamMap) =>
              iif(
                () => !!queryParamMap.get('path'),
                of(queryParamMap.get('path') as string).pipe(
                  // filter(
                  //   // TODO Lyasrt проверять, что строка соответствует строке пути. То есть числа и символы с разделителем /
                  //   (queryPath): queryPath is string =>
                  //     typeof queryPath !== 'undefined',
                  // ),
                  map((queryPath) => {
                    this.clearQueryParams();
                    console.log(queryPath);
                    return queryPath;
                  }),
                ),
                of(pathFromSignal),
              ),
            ),
          ),
        ),
      ),
      this.fetchSignalObs$,
    ]).pipe(
      switchMap(([path]) => {
        console.log('path', path);
        this.setLastPathState(path);
        return this.explorerRequestBuilderService.buildViewRequest(path);
      }),
      switchMap((request: QtisRequestResponse<ViewRequest>) =>
        this.dispatchService
          .dispatch<ViewRequest, ViewResponse>(request)
          .pipe(
            map((response: QtisRequestResponse<ViewResponse>) =>
              response.r.flatMap((r: ViewResponse) => r.content),
            ),
          ),
      ),
      switchMap((contents) =>
        combineLatest([
          of(contents),
          this.cachedDictionaryService.securityOptions$,
        ]).pipe(
          switchMap(([contents, securityLevelOptions]) => {
            const cont = contents.map<FileSystemObject>((obj) => {
              const matchingDict = securityLevelOptions.find(
                (dict) => dict.value === obj.securityLevel?.toString(),
              );
              const ext =
                obj.fileName.split('.').pop()?.toLowerCase() ??
                DocumentFileExtensions.Empty;
              let previewRoute: string | undefined = undefined;

              const isDocExt = Object.values<string>(
                DocumentFileExtensions,
              ).includes(ext);
              const isImgExt =
                Object.values<string>(ImgFileExtensions).includes(ext);
              const isTxtExt =
                Object.values<string>(TextFileExtensions).includes(ext);

              if (isDocExt) {
                previewRoute = ExplorerRoutes.PdfPreview;
              }

              if (isImgExt) {
                previewRoute = ExplorerRoutes.ImgPreview;
              }

              if (isTxtExt) {
                previewRoute = ExplorerRoutes.TxtPreview;
              }

              const value: FileSystemObject = {
                ...obj,
                securityLevel: matchingDict ?? {
                  displayText: '',
                  value: undefined,
                },
                showPreviewButton: obj.type === ExplorerFsObjectTypes.FILE,
                previewRoute,
              };
              return value;
            });
            return of({ isLoading: false, isError: false, content: cont });
          }),
        ),
      ),
      startWith({ isLoading: true, isError: false, content: undefined }),
      catchError((err: HttpErrorResponse) => {
        this.setPath('/');
        this.snackBar.open(err.error, 'close');
        return EMPTY;
      }),
      finalize(() => {
        console.log('finalized');
      }),
      repeat(),
    );
  }

  getLastPathState(): string {
    return (
      localStorage.getItem(`${this.lastPathStorageKey}${this.userId()}`) ?? '/'
    );
  }

  setLastPathState(path: string): void {
    localStorage.setItem(`${this.lastPathStorageKey}${this.userId()}`, path);
  }

  getFullPathToLastFolder(path: string): string {
    path = path.replace(/\/$/, '');
    const pathArr = path.split('/');
    pathArr.pop();
    return pathArr.join('/');
  }

  makeVersionLinks(rows: FileSystemObject[]): string[] {
    const itemsWithoutFileId = rows.filter((row) => row.fileId === undefined);
    const itemsWithFileId = rows.filter((row) => row.fileId !== undefined);
    if (itemsWithoutFileId.length === rows.length) {
      this.snackBar.open(
        this.translateService.instant('EXPLORER.ERRORS.VIRTUAL_OBJECT_ERROR'),
        'close',
      );
      return [];
    }

    return itemsWithFileId.map((row) => {
      const httpParams = new HttpParams({
        fromObject: {
          subsys: Subsystems.TIS,
          request: ExplorerRequestActions.VIEW,
          ZID: row.fileId!,
        },
      });
      return `${
        this.document.location.origin
      }/lk/qtis.jsp?${httpParams.toString()}`;
    });
  }

  clearQueryParams(): void {
    this.router.navigate([], {
      queryParams: null,
      queryParamsHandling: null,
    });
  }
}
