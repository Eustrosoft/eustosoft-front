import { inject, Injectable } from '@angular/core';
import { QtisTestFormService } from './qtis-test-form.service';
import {
  catchError,
  concatMap,
  finalize,
  iif,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  throwError,
} from 'rxjs';
import { LoginService } from '@eustrosoft-front/security';
import { HttpErrorResponse } from '@angular/common/http';
import { TestCaseResult } from '../interfaces/test-case-result.interface';
import { TestResult } from '../interfaces/test-case.interface';
import {
  ExplorerFsObjectTypes,
  ExplorerService,
} from '@eustrosoft-front/explorer-lib';
import { isArrayNotEmpty } from '../functions/is-array-not-empty.function';
import { QtisRequestResponse } from '@eustrosoft-front/core';
import { LoginLogoutResponse } from '@eustrosoft-front/login-lib';

@Injectable({
  providedIn: 'root',
})
export class QtisTestSuiteService {
  private readonly qtisTestFormService = inject(QtisTestFormService);
  private readonly explorerService = inject(ExplorerService);
  private readonly loginService = inject(LoginService);
  private readonly runFsTestsSubject = new Subject<void>();

  runFsTests(): void {
    this.runFsTestsSubject.next();
  }

  runFsTests$(): Observable<void> {
    return this.runFsTestsSubject.asObservable();
  }

  executeFsTests(): Observable<{
    isLoading: boolean;
    isError: boolean;
    results: TestCaseResult[] | undefined;
  }> {
    // login -> create folder -> check if folder created with correct security level and description
    // -> create folder inside created folder -> upload file to nested folder
    // -> rename file -> copy to parent folder -> delete from child folder
    const testData = this.qtisTestFormService.form.getRawValue();
    return of(true).pipe(
      switchMap(() =>
        this.loginService.login(testData.login, testData.password).pipe(
          map<QtisRequestResponse<LoginLogoutResponse>, TestCaseResult[]>(
            (response) => [
              {
                title: 'Login',
                description:
                  'Login with Test User Login and Test User Password',
                response,
                result: TestResult.OK,
              },
            ],
          ),
          catchError((err: HttpErrorResponse) =>
            throwError(() => [
              {
                title: 'Login',
                description: 'Login',
                responseStatus: `${err.status} ${err.statusText}`,
                response: err.error ?? '',
                errorText: 'Cant execute next tests without login',
                result: TestResult.FAIL,
              },
            ]),
          ),
        ),
      ),
      concatMap((testResults) => {
        const folderName = `test-folder-${Date.now()}`;
        return this.explorerService
          .create(
            testData.folderForTests,
            folderName,
            ExplorerFsObjectTypes.DIRECTORY,
            testData.folderDescription,
            testData.folderSecurityLevel.toString(),
          )
          .pipe(
            concatMap(() =>
              this.explorerService.getContents(testData.folderForTests).pipe(
                concatMap((response) => {
                  const createdFolder = response?.content?.find(
                    (item) => item.fileName === folderName,
                  );
                  let result: TestCaseResult[] = [];
                  if (createdFolder === undefined) {
                    return throwError(() => [
                      ...testResults,
                      {
                        title: `Create folder in ${testData.folderForTests}`,
                        description: 'Check if directory was created',
                        response: response,
                        errorText:
                          'Cant execute next tests without created directory',
                        result: TestResult.FAIL,
                      },
                    ]);
                  }
                  result = [
                    ...result,
                    {
                      title: `Create folder in ${testData.folderForTests}`,
                      description: 'Check if directory was created',
                      response: response.content,
                      result: TestResult.OK,
                    },
                  ];
                  result = [
                    ...result,
                    {
                      title: 'Check description',
                      description: `Check if description of ${testData.folderForTests}/${folderName} equals ${testData.folderDescription}`,
                      response: response.content,
                      result:
                        createdFolder.description === testData.folderDescription
                          ? TestResult.OK
                          : TestResult.FAIL,
                    },
                  ];
                  result = [
                    ...result,
                    {
                      title: 'Check security level',
                      description: `Check if securityLevel of ${testData.folderForTests}/${folderName} equals ${testData.folderSecurityLevel}`,
                      response: response.content,
                      result:
                        Number(createdFolder.securityLevel.value) ===
                        testData.folderSecurityLevel
                          ? TestResult.OK
                          : TestResult.FAIL,
                    },
                  ];
                  return of([...testResults, ...result]);
                }),
              ),
            ),
          );
      }),
      concatMap((testResults) =>
        this.explorerService.getContents(testData.folderForTests).pipe(
          switchMap((list) =>
            iif(
              () => isArrayNotEmpty(list.content),
              of([
                ...testResults,
                {
                  title: 'List Directory Contents',
                  description: '',
                  response: list.content,
                  result: TestResult.OK,
                },
              ]),
              of([
                ...testResults,
                {
                  title: 'Login',
                  description: 'Login',
                  response: list.content,
                  result: TestResult.FAIL,
                },
              ]),
            ),
          ),
        ),
      ),
      map((results) => ({
        isLoading: false,
        isError: false,
        results,
      })),
      startWith({
        isLoading: true,
        isError: false,
        results: undefined,
      }),
      catchError((results: TestCaseResult[]) =>
        of({
          isLoading: false,
          isError: true,
          results,
        }),
      ),
      // takeUntil(this.fatalError$),
      finalize(() => {
        console.warn('finalize');
      }),
      // repeat(),
    );
  }

  // makeTestList(
  //   formValue: ReturnType<typeof this.qtisTestFormService.form.getRawValue>,
  // ): TestCasesTuple;
  //
  // private createTestCase<T>(
  //   title: string,
  //   description: string,
  //   requestFactory: RequestFactory<T>,
  //   comparator: (response: QtisRequestResponse<T>) => boolean,
  //   start: Subject<void>,
  // ): ApiTestCase<T> {
  //   const abort = requestFactory.cancelRequest;
  //
  //   const baseResponse: ResponseObs<T> = {
  //     isLoading: false,
  //     isError: false,
  //     isCanceled: false,
  //     response: undefined,
  //     testResult: undefined,
  //   };
  //
  //   const response$ = start.asObservable().pipe(
  //     switchMap(() =>
  //       from(requestFactory.makeRequest()).pipe(
  //         map((res) => {
  //           const isSuccess = comparator(res);
  //           return {
  //             ...baseResponse,
  //             response: res.data,
  //             testResult: isSuccess ? TestResult.OK : TestResult.FAIL,
  //           };
  //         }),
  //         startWith({
  //           ...baseResponse,
  //           isLoading: true,
  //         }),
  //         catchError((err) => {
  //           if (err instanceof CanceledError) {
  //             return of({
  //               ...baseResponse,
  //               isCanceled: true,
  //               testResult: TestResult.CANCELED,
  //             });
  //           }
  //           return of({
  //             ...baseResponse,
  //             isError: true,
  //           });
  //         }),
  //       ),
  //     ),
  //     shareReplay(1),
  //   );
  //
  //   return { title, description, abort, response$, start };
  // }
}
