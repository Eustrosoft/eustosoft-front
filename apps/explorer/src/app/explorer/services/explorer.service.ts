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
  DispatchService,
  QtisRequestResponseInterface,
  UploadHexRequest,
  UploadResponse,
  ViewRequest,
  ViewResponse,
} from '@eustrosoft-front/core';
import {
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { APP_CONFIG } from '@eustrosoft-front/config';
import { ExplorerRequestBuilderService } from './explorer-request-builder.service';
import { ExplorerDictionaryService } from './explorer-dictionary.service';
import { FileSystemObject } from '../models/file-system-object.interface';

@Injectable()
export class ExplorerService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);
  private explorerRequestBuilderService = inject(ExplorerRequestBuilderService);
  private dispatchService = inject(DispatchService);
  private explorerDictionaryService = inject(ExplorerDictionaryService);

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
        this.dispatchService.dispatch<ViewRequest, ViewResponse>(request).pipe(
          map((response: QtisRequestResponseInterface<ViewResponse>) =>
            response.r.flatMap((r: ViewResponse) => r.content)
          ),
          catchError((err: HttpErrorResponse) => throwError(() => err))
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
}
