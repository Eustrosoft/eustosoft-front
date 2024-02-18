import { inject, Injectable } from '@angular/core';
import { QtisTestFormService } from './qtis-test-form.service';
import {
  catchError,
  concatMap,
  finalize,
  iif,
  interval,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  throwError,
} from 'rxjs';
import { LoginService, SecurityLevels } from '@eustrosoft-front/security';
import { HttpErrorResponse } from '@angular/common/http';
import { TestCaseResult } from '../interfaces/test-case-result.interface';
import { TestResult } from '../interfaces/test-case.interface';
import {
  ExplorerFsObjectTypes,
  ExplorerService,
  ExplorerUploadItemFormFactoryService,
  ExplorerUploadItemsService,
  ExplorerUploadService,
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
  private readonly explorerUploadService = inject(ExplorerUploadService);
  private readonly explorerUploadItemsService = inject(
    ExplorerUploadItemsService,
  );
  private readonly explorerUploadItemFormFactoryService = inject(
    ExplorerUploadItemFormFactoryService,
  );
  private readonly loginService = inject(LoginService);
  private readonly runFsTestsSubject = new Subject<void>();
  private readonly teardownUploadSubject = new Subject<void>();
  private readonly phrases = [
    'Remembering USSR',
    'Remembering Great Depression',
    'Preventing Global Warming',
    'Mastering the Art of Procrastination',
    'Perfecting the Skill of Overthinking',
    'Becoming a Professional Couch Potato',
    'Embarking on the Quest for the Perfect Selfie',
    'Exploring the Science of Snackology',
    'Conquering the World',
    'Pursuing Excellence in the Fine Art of Napping',
    'Becoming a Connoisseur of Internet Memes',
    'Juggling Responsibilities Like a Circus Performer',
    'Meditation: Finding Inner Peace or Just Napping Sitting Up?',
    'Solving First World Problems, One Complaint at a Time',
    'The Zen of Procrastination: Why Do Today What You Can Do Tomorrow?',
    'From Couch Potato to Couch Connoisseur: A Journey of Snacks and Streaming',
    'The Fine Art of Avoiding Responsibilities: A Beginners Guide',
    'Embracing the Chaos: Living in a World of Endless Notifications',
    'Perfecting the Fine Art of Excuse-Making',
    'Living Life on the Edge of the Bed: The Chronicles of Lazy Adventure',
  ];

  getPhraseObservable(): Observable<string> {
    return interval(2000).pipe(
      startWith(0),
      map(() => {
        const randomIndex = Math.floor(Math.random() * this.phrases.length);
        return this.phrases[randomIndex];
      }),
    );
  }

  runFsTests(): void {
    this.runFsTestsSubject.next();
  }

  runFsTests$(): Observable<void> {
    return this.runFsTestsSubject.asObservable();
  }

  teardownUpload(): void {
    this.teardownUploadSubject.next();
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
            concatMap((testResults) => {
              if (testData.files.length === 0) {
                return throwError(() => [
                  ...testResults,
                  {
                    title: 'Upload file',
                    description: 'Upload file to folder',
                    errorText:
                      'Cant proceed without a file. Attach a file in Data For Tests tab',
                    result: TestResult.FAIL,
                  },
                ]);
              }
              const dateNow = Date.now();
              const nestedFolderName = `nested-folder-${dateNow}`;
              const uploadedFileName = `${dateNow}-${testData.fileName}`;
              const folderPath = `${testData.folderForTests}/${folderName}`;
              const fileUploadPath = `${testData.folderForTests}/${folderName}/${nestedFolderName}`;
              return this.explorerService
                .create(
                  folderPath,
                  nestedFolderName,
                  ExplorerFsObjectTypes.DIRECTORY,
                  testData.folderDescription,
                  testData.folderSecurityLevel.toString(),
                )
                .pipe(
                  concatMap(() => {
                    const formArray =
                      this.explorerUploadItemFormFactoryService.makeUploadItemsForm(
                        testData.files,
                        fileUploadPath,
                        <SecurityLevels>testData.folderSecurityLevel.toString(),
                      );
                    const control = formArray.controls.find(
                      (item) =>
                        item.controls.filename.value === testData.fileName,
                    );
                    control?.patchValue(
                      {
                        ...control.value,
                        filename: uploadedFileName,
                      },
                      { emitEvent: false },
                    );
                    this.explorerUploadItemsService.uploadItems$.next(
                      formArray,
                    );
                    return this.explorerUploadService
                      .uploadHexString(fileUploadPath)
                      .pipe(
                        takeUntil(this.teardownUploadSubject),
                        catchError((err: HttpErrorResponse) =>
                          throwError(() => [
                            ...testResults,
                            {
                              title: 'Upload file',
                              description: `Upload file to ${testData.folderForTests}/${folderName}/${nestedFolderName}`,
                              responseStatus: `${err.status} ${err.statusText}`,
                              response: err.error ?? '',
                              errorText:
                                'Cant execute next tests without uploaded file',
                              result: TestResult.FAIL,
                            },
                          ]),
                        ),
                      );
                  }),
                  concatMap(() => {
                    this.teardownUpload();
                    return this.explorerService
                      .getContents(
                        `${testData.folderForTests}/${folderName}/${nestedFolderName}`,
                      )
                      .pipe(
                        concatMap((response) => {
                          const uploadedFile = response?.content?.find(
                            (item) => item.fileName === uploadedFileName,
                          );
                          if (uploadedFile === undefined) {
                            return throwError(() => [
                              ...testResults,
                              {
                                title: 'Upload file',
                                description: `Check if file was uploaded  to ${testData.folderForTests}/${folderName}/${nestedFolderName}`,
                                response: response,
                                errorText:
                                  'Cant execute next tests without uploaded file',
                                result: TestResult.FAIL,
                              },
                            ]);
                          }
                          return of([
                            ...testResults,
                            {
                              title: 'Upload file',
                              description: `Check if file was uploaded to ${testData.folderForTests}/${folderName}/${nestedFolderName}`,
                              response: response.content,
                              result: TestResult.OK,
                            },
                          ]);
                        }),
                      );
                  }),
                );
            }),
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
