/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import {
  CmsDownloadParams,
  CmsRequestActions,
  CreateRequest,
  CreateResponse,
  DispatchService,
  FileSystemObjectTypes,
  MoveRequest,
  MoveResponse,
  QtisRequestResponseInterface,
  UploadHexRequest,
  UploadResponse,
  ViewRequest,
  ViewResponse,
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
import { ExplorerDictionaryService } from './explorer-dictionary.service';
import { FileSystemObject } from '../models/file-system-object.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExplorerPathService } from './explorer-path.service';
import { RenameDialogReturnData } from '../components/rename-dialog/rename-dialog-return-data.interface';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class ExplorerService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly explorerRequestBuilderService = inject(
    ExplorerRequestBuilderService
  );
  private readonly dispatchService = inject(DispatchService);
  private readonly explorerDictionaryService = inject(
    ExplorerDictionaryService
  );
  private readonly snackBar = inject(MatSnackBar);
  private readonly explorerPathService = inject(ExplorerPathService);
  private readonly document = inject(DOCUMENT);

  makeShareLink(path: string): Observable<string> {
    return this.config.pipe(
      switchMap((config) =>
        iif(
          () => !!config.shareUrl,
          of(`${config.shareUrl}${path}`),
          of(`${FallbackConfig.shareUrl}${path}`)
        ).pipe(
          switchMap(() =>
            iif(
              () => config.shareUrl.includes(OriginReplaceString),
              of(
                `${config.shareUrl.replace(
                  OriginReplaceString,
                  this.document.location.origin
                )}${path}`
              ),
              of(`${config.shareUrl}${path}`)
            )
          )
        )
      )
    );
  }

  makeOWikiShareLink(path: string): Observable<string> {
    return this.config.pipe(
      switchMap((config) =>
        iif(
          () => !!config.shareOWikiUrl,
          of(`${config.shareOWikiUrl}${path}`),
          of(`${FallbackConfig.shareOWikiUrl}${path}`)
        )
      )
    );
  }

  makeDownloadLink(
    parameterValue: string,
    parameterName: CmsDownloadParams = CmsDownloadParams.TICKET
  ): Observable<string> {
    return this.config.pipe(
      map(
        (config) =>
          `${config.apiUrl}/download?${parameterName}=${parameterValue}`
      )
    );
  }

  getContents(path: string): Observable<{
    isLoading: boolean;
    isError: boolean;
    content: FileSystemObject[] | undefined;
  }> {
    return of(path).pipe(
      switchMap((path) =>
        this.explorerRequestBuilderService.buildViewRequest(path)
      ),
      switchMap((request: QtisRequestResponseInterface<ViewRequest>) =>
        this.dispatchService
          .dispatch<ViewRequest, ViewResponse>(request)
          .pipe(
            map((response: QtisRequestResponseInterface<ViewResponse>) =>
              response.r.flatMap((r: ViewResponse) => r.content)
            )
          )
      ),
      switchMap((contents) =>
        combineLatest([
          of(contents),
          this.explorerDictionaryService.securityOptions$,
        ]).pipe(
          switchMap(([contents, securityLevelOptions]) => {
            const cont = contents.map<FileSystemObject>((obj) => {
              const matchingDict = securityLevelOptions.find(
                (dict) => dict.value === obj.securityLevel?.toString()
              );
              const value: FileSystemObject = {
                ...obj,
                securityLevel: matchingDict ?? {
                  displayText: '',
                  value: undefined,
                },
              };
              return value;
            });
            return of({ isLoading: false, isError: false, content: cont });
          })
        )
      )
    );
  }

  uploadHexChunks(
    body: QtisRequestResponseInterface<UploadHexRequest>,
    headers: { [p: string]: string | string[] }
  ): Observable<QtisRequestResponseInterface<UploadResponse>> {
    return this.config.pipe(
      switchMap((config) =>
        this.http.post<QtisRequestResponseInterface<UploadResponse>>(
          `${config.apiUrl}/dispatch`,
          body,
          {
            headers: new HttpHeaders(headers),
          }
        )
      )
    );
  }

  create(
    path: string,
    name: string,
    type: FileSystemObjectTypes,
    description: string = '',
    securityLevel: string | undefined = undefined
  ): Observable<QtisRequestResponseInterface<CreateResponse>> {
    const params: Omit<CreateRequest, 's' | 'l' | 'r'> = {
      path,
      type,
      fileName: name,
      description,
    };
    if (securityLevel) {
      params.securityLevel = +securityLevel;
    }
    return this.explorerRequestBuilderService.buildCreateRequest(params).pipe(
      switchMap((body: QtisRequestResponseInterface<CreateRequest>) =>
        this.dispatchService.dispatch<CreateRequest, CreateResponse>(body)
      ),
      catchError((err) => this.handleError(err))
    );
  }

  move(
    row: FileSystemObject,
    data: RenameDialogReturnData
  ): Observable<QtisRequestResponseInterface<MoveResponse>> {
    return of(row.fullPath).pipe(
      switchMap((fullPath) =>
        of(this.explorerPathService.getFullPathToLastFolder(fullPath))
      ),
      switchMap((folder) =>
        iif(
          () => data.name !== row.fileName,
          this.explorerRequestBuilderService.buildMoveRequest(
            [row],
            [`${folder}/${data.name}`],
            data.description ?? ''
          ),
          this.explorerRequestBuilderService.buildMoveRequest(
            [row],
            [`${folder}/${data.name}`],
            data.description ?? '',
            CmsRequestActions.RENAME
          )
        )
      ),
      switchMap((body: QtisRequestResponseInterface<MoveRequest>) =>
        this.dispatchService.dispatch<MoveRequest, MoveResponse>(body)
      ),
      catchError((err) => this.handleError(err))
    );
  }

  handleError(err: HttpErrorResponse): Observable<never> {
    this.snackBar.open(err.error, 'close');
    return EMPTY;
  }
}
