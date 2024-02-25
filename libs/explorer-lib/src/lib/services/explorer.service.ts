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
  QtisRequestResponse,
  TextFileExtensions,
} from '@eustrosoft-front/core';
import {
  catchError,
  combineLatest,
  EMPTY,
  iif,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import {
  APP_CONFIG,
  FallbackConfig,
  OriginReplaceString,
} from '@eustrosoft-front/config';
import { ExplorerRequestBuilderService } from './explorer-request-builder.service';
import {
  CreateRequest,
  MoveRequest,
  ViewRequest,
} from '../interfaces/explorer-request.interface';
import {
  CreateResponse,
  MoveResponse,
  ViewResponse,
} from '../interfaces/explorer-response.interface';
import { ExplorerDownloadParams } from '../constants/enums/explorer-download-params.enum';
import { ExplorerFsObjectTypes } from '../constants/enums/explorer-fs-object-types.enum';
import { ExplorerRequestActions } from '../constants/enums/explorer-actions.enum';
import { FileSystemObject } from '../interfaces/file-system-object.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExplorerPathService } from './explorer-path.service';
import { RenameDialogReturnData } from '../interfaces/rename-dialog/rename-dialog-return-data.interface';
import { DOCUMENT } from '@angular/common';
import { CachedDictionaryService } from '@eustrosoft-front/dic';
import { ExplorerRoutes } from '../constants/enums/explorer-routes.enum';

@Injectable({ providedIn: 'root' })
export class ExplorerService {
  private readonly config = inject(APP_CONFIG);
  private readonly explorerRequestBuilderService = inject(
    ExplorerRequestBuilderService,
  );
  private readonly dispatchService = inject(DispatchService);
  private readonly cachedDictionaryService = inject(CachedDictionaryService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly explorerPathService = inject(ExplorerPathService);
  private readonly document = inject(DOCUMENT);

  makeShareLink(path: string): Observable<string> {
    return this.config.pipe(
      switchMap((config) =>
        iif(
          () => !!config.shareUrl,
          of(`${config.shareUrl}${path}`),
          of(`${FallbackConfig.shareUrl}${path}`),
        ).pipe(
          switchMap(() =>
            iif(
              () => config.shareUrl.includes(OriginReplaceString),
              of(
                `${config.shareUrl.replace(
                  OriginReplaceString,
                  this.document.location.origin,
                )}${path}`,
              ),
              of(`${config.shareUrl}${path}`),
            ),
          ),
        ),
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
          fromString: `${parameterName}=${parameterValue}`,
        });
        return `${config.apiUrl}/download?${params.toString()}`;
      }),
    );
  }

  getContents(path: string): Observable<{
    isLoading: boolean;
    isError: boolean;
    content: FileSystemObject[] | undefined;
  }> {
    return of(path).pipe(
      switchMap((path) =>
        this.explorerRequestBuilderService.buildViewRequest(path),
      ),
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
      catchError((err) => this.handleError(err)),
    );
  }

  move(
    row: FileSystemObject,
    data: RenameDialogReturnData,
  ): Observable<QtisRequestResponse<MoveResponse>> {
    return of(row.fullPath).pipe(
      switchMap((fullPath) =>
        of(this.explorerPathService.getFullPathToLastFolder(fullPath)),
      ),
      switchMap((folder) =>
        iif(
          () => data.name !== row.fileName,
          this.explorerRequestBuilderService.buildMoveRequest(
            [row],
            [`${folder}/${data.name}`],
            data.description ?? '',
            ExplorerRequestActions.RENAME,
          ),
          this.explorerRequestBuilderService.buildMoveRequest(
            [row],
            [`${folder}/${data.name}`],
            data.description ?? '',
          ),
        ),
      ),
      switchMap((body: QtisRequestResponse<MoveRequest>) =>
        this.dispatchService.dispatch<MoveRequest, MoveResponse>(body),
      ),
      catchError((err) => this.handleError(err)),
    );
  }

  handleError(err: HttpErrorResponse): Observable<never> {
    this.snackBar.open(err.error, 'close');
    return EMPTY;
  }
}
