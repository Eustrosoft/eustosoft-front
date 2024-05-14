/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import {
  DispatchService,
  DocumentFileExtensions,
  ImgFileExtensions,
  PRECONFIGURED_TRANSLATE_SERVICE,
  QtisRequestResponse,
  ReplaceOriginPipe,
  Subsystems,
  TextFileExtensions,
  WINDOW,
} from '@eustrosoft-front/core';
import {
  catchError,
  combineLatest,
  iif,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { APP_CONFIG, FallbackConfig } from '@eustrosoft-front/config';
import { ExplorerRequestBuilderService } from './explorer-request-builder.service';
import {
  CreateRequest,
  DeleteRequest,
  MoveRequest,
  ViewRequest,
} from '../interfaces/explorer-request.interface';
import {
  CreateResponse,
  DeleteResponse,
  MoveResponse,
  ViewResponse,
} from '../interfaces/explorer-response.interface';
import { ExplorerDownloadParams } from '../constants/enums/explorer-download-params.enum';
import { ExplorerFsObjectTypes } from '../constants/enums/explorer-fs-object-types.enum';
import { FileSystemObject } from '../interfaces/file-system-object.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RenameDialogReturnData } from '../interfaces/rename-dialog/rename-dialog-return-data.interface';
import { ExplorerRequestActions } from '../constants/enums/explorer-actions.enum';
import { ExplorerRoutes } from '../constants/enums/explorer-routes.enum';
import { CachedDictionaryService } from '@eustrosoft-front/dic';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ExplorerService {
  private readonly config = inject(APP_CONFIG);
  private readonly explorerRequestBuilderService = inject(
    ExplorerRequestBuilderService,
  );
  private readonly dispatchService = inject(DispatchService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly replaceOriginPipe = inject(ReplaceOriginPipe);
  private readonly cachedDictionaryService = inject(CachedDictionaryService);
  private readonly translateService = inject(PRECONFIGURED_TRANSLATE_SERVICE);
  private readonly window = inject(WINDOW);
  private readonly router = inject(Router);

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
        this.window.location.origin
      }/lk/qtis.jsp?${httpParams.toString()}`;
    });
  }

  makeShareLink(path: string): Observable<string> {
    return this.config.pipe(
      switchMap((config) =>
        iif(
          () => !!config.shareUrl,
          of(`${config.shareUrl}${path}`),
          of(`${FallbackConfig.shareUrl}${path}`),
        ).pipe(map((url) => this.replaceOriginPipe.transform(url))),
      ),
    );
  }

  makeOWikiShareLink(path: string): Observable<string> {
    return this.config.pipe(
      switchMap((config) =>
        iif(
          () => !!config.shareOWikiUrl,
          of(`${config.shareOWikiUrl}${path}`),
          of(`${FallbackConfig.shareOWikiUrl}${path}`),
        ),
      ),
    );
  }

  makeDownloadLink(
    parameterValue: string,
    parameterName: ExplorerDownloadParams = ExplorerDownloadParams.TICKET,
  ): Observable<string> {
    return this.config.pipe(
      map((config) => {
        const params = new HttpParams({
          fromObject: {
            [parameterName]: parameterValue,
          },
        });
        return `${config.apiUrl}/download?${params.toString()}`;
      }),
    );
  }

  create(
    path: string,
    name: string,
    type: ExplorerFsObjectTypes,
    description: string = '',
    securityLevel: string | undefined = undefined,
  ): Observable<QtisRequestResponse<CreateResponse>> {
    const params: Omit<CreateRequest, 's' | 'l' | 'r'> = {
      path,
      type,
      fileName: name,
      description,
    };
    if (securityLevel !== undefined) {
      params.securityLevel = +securityLevel;
    }
    return this.explorerRequestBuilderService.buildCreateRequest(params).pipe(
      switchMap((body: QtisRequestResponse<CreateRequest>) =>
        this.dispatchService.dispatch<CreateRequest, CreateResponse>(body),
      ),
      catchError((err: HttpErrorResponse) => this.handleError(err)),
    );
  }

  rename(
    row: FileSystemObject,
    data: RenameDialogReturnData,
    folder: string,
  ): Observable<QtisRequestResponse<MoveResponse>> {
    return this.explorerRequestBuilderService
      .buildMoveRequest(
        [row.fullPath],
        [`${folder}/${data.name}`],
        data.description ?? '',
      )
      .pipe(
        switchMap((body: QtisRequestResponse<MoveRequest>) =>
          this.dispatchService.dispatch<MoveRequest, MoveResponse>(body),
        ),
        catchError((err) => this.handleError(err)),
      );
  }

  move(
    from: FileSystemObject[],
    to: string[],
    explorerRequestActions = ExplorerRequestActions.MOVE,
  ): Observable<{ to: string[]; res: QtisRequestResponse<MoveResponse> }> {
    return of(true).pipe(
      switchMap(() =>
        this.explorerRequestBuilderService.buildMoveCopyRequest(
          from.map((fr) => fr.fullPath),
          to,
          explorerRequestActions,
        ),
      ),
      switchMap((body) =>
        this.dispatchService.dispatch<MoveRequest, MoveResponse>(body),
      ),
      switchMap((res) => of({ to, res })),
      catchError((err) => this.handleError(err)),
    );
  }

  delete(
    rows: FileSystemObject[],
  ): Observable<QtisRequestResponse<DeleteResponse>> {
    return this.explorerRequestBuilderService.buildDeleteRequests(rows).pipe(
      switchMap((body: QtisRequestResponse<DeleteRequest>) =>
        this.dispatchService.dispatch<DeleteRequest, DeleteResponse>(body),
      ),
      catchError((err) => this.handleError(err)),
    );
  }

  handleError(err: HttpErrorResponse): Observable<never> {
    this.snackBar.open(err.error, 'close');
    return throwError(() => err);
  }

  /**
   * Used only for qtis-tests.service.ts
   * @deprecated
   * @param path Where to get contents from
   */
  getContentsLegacy(path: string): Observable<{
    isLoading: boolean;
    isError: boolean;
    content: FileSystemObject[] | null;
  }> {
    return of(path).pipe(
      switchMap((path) => {
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
    );
  }

  clearQueryParams(): void {
    this.router.navigate([], {
      queryParams: null,
      queryParamsHandling: null,
    });
  }
}
