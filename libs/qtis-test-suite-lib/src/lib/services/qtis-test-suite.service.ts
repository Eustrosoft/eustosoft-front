import { inject, Injectable } from '@angular/core';
import { DAO_FS, DAO_QSYS } from '../di/dao.token';
import {
  catchError,
  concatMap,
  from,
  map,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { TestCasesTuple } from '../interfaces/test-cases-tuple.type';
import {
  ApiTestCase,
  ResponseObs,
  TestResult,
} from '../interfaces/test-case.interface';
import {
  AuthLoginLogoutResponse,
  AxiosResponse,
  CanceledError,
  FsUploadHexResponse,
  FsViewResponse,
  PingResponse,
  RequestFactory,
} from '@eustrosoft-front/dao-ts';
import { QtisRequestResponse } from '@eustrosoft-front/core';
import { QtisTestFormService } from './qtis-test-form.service';

@Injectable({
  providedIn: 'root',
})
export class QtisTestSuiteService {
  private readonly qSys = inject(DAO_QSYS);
  private readonly fs = inject(DAO_FS);
  private readonly qtisTestFormService = inject(QtisTestFormService);

  makeTestList(
    formValue: ReturnType<typeof this.qtisTestFormService.form.getRawValue>,
  ): TestCasesTuple {
    const byteArray = new Uint8Array(2 * 1024 * 1024); // 2MB
    // Create a Blob from the byte array
    const blob = new Blob([byteArray], { type: 'application/octet-stream' });
    // Create a File from the Blob
    const file = new File([blob], 'example.txt', { type: 'text/plain' });

    return [
      // TODO Сделать реальные comparator функции
      this.createTestCase<AuthLoginLogoutResponse>(
        'Login',
        'Login request',
        this.qSys.login(formValue.login, formValue.password),
        () => false,
        new Subject<void>(),
      ),
      this.createTestCase<PingResponse>(
        'Ping',
        'Ping request',
        this.qSys.ping(),
        () => true,
        new Subject<void>(),
      ),
      this.createTestCase<FsViewResponse>(
        'List FS objects',
        'List filesystem objects',
        this.fs.listFs(formValue.fsPath),
        () => true,
        new Subject<void>(),
      ),
      this.createUploadFilesTestCase(
        'Upload files',
        'Upload files',
        this.fs.uploadFiles(
          [{ file, filename: '123', securityLevel: 31, description: '5555' }],
          '/LOCAL/pub/test-2024-02-05',
        ),
        () => true,
        new Subject<void>(),
      ),
    ];
  }

  private createTestCase<T>(
    title: string,
    description: string,
    requestFactory: RequestFactory<T>,
    comparator: (response: AxiosResponse<QtisRequestResponse<T>>) => boolean,
    start: Subject<void>,
  ): ApiTestCase<T> {
    const abort = requestFactory.cancelRequest;

    const baseResponse: ResponseObs<T> = {
      isLoading: false,
      isError: false,
      isCanceled: false,
      response: undefined,
      testResult: undefined,
    };

    const response$ = start.asObservable().pipe(
      switchMap(() =>
        from(requestFactory.makeRequest()).pipe(
          map((res) => {
            const isSuccess = comparator(res);
            return {
              ...baseResponse,
              response: res.data,
              testResult: isSuccess ? TestResult.OK : TestResult.FAIL,
            };
          }),
          startWith({
            ...baseResponse,
            isLoading: true,
          }),
          catchError((err) => {
            if (err instanceof CanceledError) {
              return of({
                ...baseResponse,
                isCanceled: true,
                testResult: TestResult.CANCELED,
              });
            }
            return of({
              ...baseResponse,
              isError: true,
            });
          }),
        ),
      ),
      shareReplay(1),
    );

    return { title, description, abort, response$, start };
  }

  private createUploadFilesTestCase(
    title: string,
    description: string,
    factories: Promise<RequestFactory<FsUploadHexResponse>[]>,
    comparator: (
      response: AxiosResponse<QtisRequestResponse<FsUploadHexResponse>>,
    ) => boolean,
    start: Subject<void>,
  ): ApiTestCase<FsUploadHexResponse> {
    const abort = async () => {
      const fts = await factories;
      fts.forEach((ft) => ft.cancelRequest());
    };

    const baseResponse: ResponseObs<FsUploadHexResponse> = {
      isLoading: false,
      isError: false,
      isCanceled: false,
      response: undefined,
      testResult: undefined,
    };

    const response$ = start.asObservable().pipe(
      switchMap(() =>
        from(factories).pipe(
          concatMap((factories) => from(factories)),
          concatMap((factory) =>
            from(factory.makeRequest()).pipe(
              map((res) => {
                const isSuccess = comparator(res);
                return {
                  ...baseResponse,
                  response: res.data,
                  testResult: isSuccess ? TestResult.OK : TestResult.FAIL,
                };
              }),
              startWith({
                ...baseResponse,
                isLoading: true,
              }),
              catchError((err) => {
                if (err instanceof CanceledError) {
                  return of({
                    ...baseResponse,
                    isCanceled: true,
                    testResult: TestResult.CANCELED,
                  });
                }
                return of({
                  ...baseResponse,
                  isError: true,
                });
              }),
            ),
          ),
        ),
      ),
    );
    return { title, description, abort, response$, start };
  }
}
