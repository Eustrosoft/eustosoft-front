/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import {
  QtisRequestResponse,
  Subsystems,
  SupportedLanguages,
} from '@eustrosoft-front/core';
import { combineLatest, mergeMap, Observable, of } from 'rxjs';
import { FormArray, FormGroup } from '@angular/forms';
import { SingleRequestForm } from '../interfaces/request.types';
import {
  DispatcherActions,
  DispatcherQueryTypes,
  FileRequest,
  SqlRequest,
} from '@eustrosoft-front/dispatcher-lib';
import { FileReaderService } from '@eustrosoft-front/explorer-lib';

@Injectable({ providedIn: 'root' })
export class RequestBuilderService {
  private readonly fileReaderService = inject(FileReaderService);

  buildQuery(
    forms: FormArray<FormGroup<SingleRequestForm>>,
  ): Observable<QtisRequestResponse<FileRequest | SqlRequest>> {
    const requests = forms.controls.map(
      (control: FormGroup<SingleRequestForm>) => {
        switch (control.value.queryType as DispatcherQueryTypes) {
          case DispatcherQueryTypes.FILE:
            return this.buildFileQuery(control.value.file?.pop() as File);
          case DispatcherQueryTypes.SQL:
            return this.buildSqlQuery(control.value.request as string);
        }
      },
    );

    return combineLatest(requests).pipe(
      mergeMap((value: (FileRequest | SqlRequest)[]) =>
        of({
          r: value,
          t: 0,
        }),
      ),
    );
  }

  private buildSqlQuery(query: string): Observable<SqlRequest> {
    return of({
      s: Subsystems.SQL,
      r: DispatcherActions.SQL,
      l: SupportedLanguages.EN_US,
      query,
    });
  }

  private buildFileQuery(file: File): Observable<FileRequest> {
    return this.fileReaderService.blobToBase64(file).pipe(
      mergeMap((base64) =>
        of({
          s: Subsystems.SQL,
          r: DispatcherActions.SQL,
          l: SupportedLanguages.EN_US,
          parameters: {
            file: base64 as string,
            name: file.name,
            ext: file.name.split('.').pop() as string,
            method: 'application/octet-stream',
          },
          request: 'upload',
          subsystem: 'file',
        }),
      ),
    );
  }
}
