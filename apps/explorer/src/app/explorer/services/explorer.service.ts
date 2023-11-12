/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  CmsDownloadParams,
  QtisRequestResponseInterface,
  UploadHexRequest,
  UploadResponse,
} from '@eustrosoft-front/core';
import { map, Observable, switchMap } from 'rxjs';
import { APP_CONFIG } from '@eustrosoft-front/config';

@Injectable()
export class ExplorerService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  download(
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

  uploadChunks(
    body: FormData,
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
