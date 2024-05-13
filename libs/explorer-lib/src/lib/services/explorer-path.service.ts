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
  filter,
  map,
  Observable,
  of,
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

  private readonly userIdSignal = toSignal(
    this.authenticationService.userInfo$.pipe(
      map((userInfo) => userInfo.userId),
    ),
    { requireSync: true },
  );

  private readonly pathSignal = signal<string>(this.getLastPathState(), {
    equal: () => false,
  });

  private readonly fetchSignal = signal<null>(null, {
    equal: () => false,
  });

  private readonly currentFolderSignal = signal<FileSystemObject | null>(null, {
    equal: () => false,
  });

  private readonly pathSignalObs$ = toObservable<string>(this.pathSignal);

  private readonly fetchSignalObs$ = toObservable<null>(this.fetchSignal);

  setPath(path: string): void {
    this.pathSignal.set(path);
  }

  getPath(): Signal<string> {
    return this.pathSignal.asReadonly();
  }

  refreshCurrentPath(): void {
    this.fetchSignal.set(null);
  }

  setCurrentFolder(folder: FileSystemObject | null): void {
    this.currentFolderSignal.set(folder);
  }

  getCurrentFolder(): Signal<FileSystemObject | null> {
    return this.currentFolderSignal.asReadonly();
  }

  pathQueryParam$ = this.activatedRoute.queryParamMap.pipe(
    map((query) => query.get('path') ?? null),
    // TODO Lyasrt валидация path по регулярному выражению
    filter((queryPath): queryPath is string => queryPath !== null),
    tap((path) => {
      this.clearQueryParams();
      this.setPath(path);
    }),
  );

  getContents$(): Observable<{
    isLoading: boolean;
    isError: boolean;
    content: FileSystemObject[] | null;
  }> {
    return combineLatest([this.pathSignalObs$, this.fetchSignalObs$]).pipe(
      switchMap(([pathFromSignal]) =>
        combineLatest([
          this.explorerRequestBuilderService.buildViewRequest(pathFromSignal),
          of(pathFromSignal),
        ]),
      ),
      switchMap(([request, pathFromSignal]) =>
        combineLatest([
          this.dispatchService
            .dispatch<ViewRequest, ViewResponse>(request)
            .pipe(
              map((response: QtisRequestResponse<ViewResponse>) =>
                response.r.flatMap((r: ViewResponse) => r.content),
              ),
              catchError((err: HttpErrorResponse) => {
                this.clearQueryParams();
                this.setPath('/');
                this.snackBar.open(err.error, 'close');
                return EMPTY;
              }),
            ),
          of(pathFromSignal),
        ]),
      ),
      switchMap(([contents, pathFromSignal]) =>
        combineLatest([
          of(contents),
          this.cachedDictionaryService.securityOptions$,
        ]).pipe(
          switchMap(([contents, securityLevelOptions]) => {
            this.setLastPathState(pathFromSignal);
            const cont = contents.map<FileSystemObject>((obj) => {
              const matchingDict = securityLevelOptions.find(
                (dict) => dict.value === obj.securityLevel?.toString(),
              );
              const ext =
                obj.fileName.split('.').pop()?.toLowerCase() ??
                DocumentFileExtensions.Empty;
              let previewRoute: string | null = null;

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
                  value: null,
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
      startWith({ isLoading: true, isError: false, content: null }),
    );
  }

  getLastPathState(): string {
    return (
      localStorage.getItem(
        `${this.lastPathStorageKey}${this.userIdSignal()}`,
      ) ?? '/'
    );
  }

  setLastPathState(path: string): void {
    localStorage.setItem(
      `${this.lastPathStorageKey}${this.userIdSignal()}`,
      path,
    );
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
