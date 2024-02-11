import { inject, Injectable } from '@angular/core';
import { DAO_QSYS } from '../di/dao.token';
import { catchError, from, map, of, startWith, Subject, switchMap } from 'rxjs';
import { TestCasesTuple } from '../interfaces/test-cases-tuple.type';
import { ApiTestCase, CompareResult } from '../interfaces/test-case.interface';
import {
  AuthLoginLogoutResponse,
  AxiosResponse,
  PingResponse,
  RequestFactory,
} from '@eustrosoft-front/dao-ts';
import { QtisRequestResponse } from '@eustrosoft-front/core';

@Injectable({
  providedIn: 'root',
})
export class QtisApiService {
  private readonly qSys = inject(DAO_QSYS);

  makeTestList(formValue: { login: string; password: string }): TestCasesTuple {
    return [
      // TODO Сделать реальные comparator функции
      this.createTestCase<AuthLoginLogoutResponse>(
        'Login',
        'Login with correct data',
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
    ];
  }

  createTestCase<T>(
    title: string,
    description: string,
    requestFactory: RequestFactory<T>,
    comparator: (response: AxiosResponse<QtisRequestResponse<T>>) => boolean,
    start: Subject<void>,
  ): ApiTestCase<T> {
    const abort = requestFactory.cancelRequest;

    const response$ = start.asObservable().pipe(
      switchMap(() =>
        from(requestFactory.makeRequest()).pipe(
          map((res) => {
            const isSuccess = comparator(res);
            return {
              isLoading: false,
              isError: false,
              response: res.data,
              compareResult: isSuccess ? CompareResult.OK : CompareResult.FAIL,
            };
          }),
          startWith({
            isLoading: true,
            isError: false,
            response: undefined,
            compareResult: undefined,
          }),
          catchError((err) => {
            // TODO
            //  Добавить свойство isCanceled и обработчик ошибки через switch
            //  Так как если отменили - это не ошибка
            console.error(err);
            return of({
              isLoading: false,
              isError: true,
              response: undefined,
              compareResult: undefined,
            });
          }),
        ),
      ),
    );

    return { title, description, abort, requestFactory, response$, start };
  }
}
