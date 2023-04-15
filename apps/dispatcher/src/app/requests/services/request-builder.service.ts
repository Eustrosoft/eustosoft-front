import { Injectable } from '@angular/core';
import {
  DispatcherActions,
  FileReaderService,
  FileRequest,
  QtisRequestResponseInterface,
  QueryTypes,
  SingleRequestForm,
  SqlRequest,
  Subsystems,
  SupportedLanguages,
} from '@eustrosoft-front/core';
import { combineLatest, mergeMap, Observable, of } from 'rxjs';
import { FormArray, FormGroup } from '@angular/forms';

@Injectable()
export class RequestBuilderService {
  constructor(private fileReaderService: FileReaderService) {}

  buildQuery(
    forms: FormArray<FormGroup<SingleRequestForm>>
  ): Observable<QtisRequestResponseInterface<FileRequest | SqlRequest>> {
    const requests = forms.controls.map(
      (control: FormGroup<SingleRequestForm>) => {
        switch (control.value.queryType as QueryTypes) {
          case QueryTypes.FILE:
            return this.buildFileQuery(control.value.file?.pop() as File);
          case QueryTypes.SQL:
            return this.buildSqlQuery(control.value.request as string);
        }
      }
    );

    return combineLatest(requests).pipe(
      mergeMap((value: (FileRequest | SqlRequest)[]) =>
        of({
          r: value,
          t: 0,
        })
      )
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
        })
      )
    );
  }
}
