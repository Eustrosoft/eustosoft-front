import { inject, Injectable } from '@angular/core';
import { DAO_QSYS } from '../di/dao.token';
import {
  catchError,
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
  private readonly qtisTestFormService = inject(QtisTestFormService);

  makeTestList(
    formValue: ReturnType<typeof this.qtisTestFormService.form.getRawValue>,
  ): TestCasesTuple {
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
        this.qSys.listFs(formValue.fsPath),
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

    return { title, description, abort, requestFactory, response$, start };
  }
}
