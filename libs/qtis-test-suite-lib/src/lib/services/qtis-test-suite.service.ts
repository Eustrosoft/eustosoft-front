import { inject, Injectable } from '@angular/core';
import { QtisTestFormService } from './qtis-test-form.service';
import {
  catchError,
  combineLatest,
  concatMap,
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
  ExplorerRequestActions,
  ExplorerRequestBuilderService,
  ExplorerService,
  ExplorerUploadItemFormFactoryService,
  ExplorerUploadItemsService,
  ExplorerUploadService,
  MoveCopyRequest,
  MoveCopyResponse,
  MoveRequest,
  MoveResponse,
} from '@eustrosoft-front/explorer-lib';
import { DispatchService, QtisRequestResponse } from '@eustrosoft-front/core';
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
  private readonly explorerRequestBuilderService = inject(
    ExplorerRequestBuilderService,
  );
  private readonly dispatchService = inject(DispatchService);
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
    // TODO
    // rename file in parent folder (bug, source file gets renamed, not copied one) -> move from child folder to parent -> delete original some file
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
        const dateNow = Date.now();
        const folderName = `test-folder-${dateNow}`;
        const nestedFolderName = `nested-folder-${dateNow}`;
        const uploadedFileName = `${dateNow}-${testData.fileName}`;
        const folderPath = `${testData.folderForTests}/${folderName}`;
        const fileUploadPath = `${testData.folderForTests}/${folderName}/${nestedFolderName}`;
        return this.explorerService
          .create(
            testData.folderForTests,
            folderName,
            ExplorerFsObjectTypes.DIRECTORY,
            testData.folderDescription,
            testData.folderSecurityLevel.toString(),
          )
          .pipe(
            catchError((err: HttpErrorResponse) =>
              throwError(() => [
                ...testResults,
                {
                  title: `Create folder ${folderName}`,
                  description: 'Check if directory was created',
                  responseStatus: `${err.status} ${err.statusText}`,
                  response: err.error ?? '',
                  errorText:
                    'Cant execute next tests without created directory',
                  result: TestResult.FAIL,
                },
              ]),
            ),
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
                      description: `Check if description of ${testData.folderForTests}/${folderName} equals "${testData.folderDescription}"`,
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
              return this.explorerService
                .create(
                  folderPath,
                  nestedFolderName,
                  ExplorerFsObjectTypes.DIRECTORY,
                  testData.folderDescription,
                  testData.folderSecurityLevel.toString(),
                )
                .pipe(
                  catchError((err: HttpErrorResponse) =>
                    throwError(() => [
                      ...testResults,
                      {
                        title: `Create folder ${nestedFolderName} in ${testData.folderForTests}`,
                        description: 'Check if directory was created',
                        responseStatus: `${err.status} ${err.statusText}`,
                        response: err.error ?? '',
                        errorText:
                          'Cant execute next tests without created directory',
                        result: TestResult.FAIL,
                      },
                    ]),
                  ),
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
                        description: testData.fileDescription,
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
                                description: `Check if file was uploaded to ${testData.folderForTests}/${folderName}/${nestedFolderName}`,
                                response: response,
                                errorText:
                                  'Cant execute next tests without uploaded file',
                                result: TestResult.FAIL,
                              },
                            ]);
                          }
                          return combineLatest([
                            of([
                              ...testResults,
                              {
                                title: 'Upload file',
                                description: `Check if file was uploaded to ${testData.folderForTests}/${folderName}/${nestedFolderName}`,
                                response: response.content,
                                result: TestResult.OK,
                              },
                              {
                                title: 'Check file description',
                                description: `Check if description of ${uploadedFile.fileName} equals "${testData.fileDescription}"`,
                                response: response.content,
                                result:
                                  uploadedFile.description ===
                                  testData.fileDescription
                                    ? TestResult.OK
                                    : TestResult.FAIL,
                              },
                              {
                                title: 'Check security level',
                                description: `Check if securityLevel of ${uploadedFile.fileName} equals ${testData.fileSecurityLevel}`,
                                response: response.content,
                                result:
                                  Number(uploadedFile.securityLevel.value) ===
                                  testData.fileSecurityLevel
                                    ? TestResult.OK
                                    : TestResult.FAIL,
                              },
                            ]),
                            of(response.content),
                          ]);
                        }),
                      );
                  }),
                );
            }),
            concatMap(([testResults, content]) =>
              this.explorerRequestBuilderService
                .buildMoveCopyRequest(
                  content ?? [],
                  [`${folderPath}/${uploadedFileName}`],
                  ExplorerRequestActions.COPY,
                )
                .pipe(
                  concatMap((body) =>
                    this.dispatchService
                      .dispatch<MoveCopyRequest, MoveCopyResponse>(body)
                      .pipe(
                        catchError((err: HttpErrorResponse) =>
                          throwError(() => [
                            ...testResults,
                            {
                              title: 'Copy file',
                              description: `Copy file to ${folderPath}/${uploadedFileName}`,
                              responseStatus: `${err.status} ${err.statusText}`,
                              response: err.error ?? '',
                              errorText:
                                'Cant execute next tests without copied file',
                              result: TestResult.FAIL,
                            },
                          ]),
                        ),
                      ),
                  ),
                  concatMap(() =>
                    this.explorerService.getContents(
                      `${testData.folderForTests}/${folderName}`,
                    ),
                  ),
                  concatMap((response) => {
                    const copiedFile = response?.content?.find(
                      (item) => item.fileName === uploadedFileName,
                    );
                    if (copiedFile === undefined) {
                      return throwError(() => [
                        ...testResults,
                        {
                          title: 'Copy file',
                          description: `Check if file was copied to ${folderPath}/${uploadedFileName}`,
                          response: response,
                          errorText:
                            'Cant execute next tests without copied file',
                          result: TestResult.FAIL,
                        },
                      ]);
                    }
                    return combineLatest([
                      of([
                        ...testResults,
                        {
                          title: 'Check copied file',
                          description: `Check if file ${uploadedFileName} was copied to to ${folderPath}/${uploadedFileName}`,
                          response: response.content,
                          result: TestResult.OK,
                        },
                      ]),
                      of(copiedFile),
                    ]);
                  }),
                  concatMap(([testResults, copiedFile]) =>
                    this.explorerRequestBuilderService
                      .buildMoveRequest(
                        [copiedFile],
                        [`${folderPath}/Renamed-Copy-${copiedFile.fileName}`],
                        `Updated ${testData.fileDescription}`,
                      )
                      .pipe(
                        concatMap((body) =>
                          this.dispatchService
                            .dispatch<MoveRequest, MoveResponse>(body)
                            .pipe(
                              catchError((err: HttpErrorResponse) =>
                                throwError(() => [
                                  ...testResults,
                                  {
                                    title: 'Rename file',
                                    description: `Rename file to "Renamed-Copy-${copiedFile.fileName}"`,
                                    responseStatus: `${err.status} ${err.statusText}`,
                                    response: err.error ?? '',
                                    errorText:
                                      'Cant execute next tests without renamed file',
                                    result: TestResult.FAIL,
                                  },
                                ]),
                              ),
                              concatMap(() =>
                                this.explorerService.getContents(
                                  `${folderPath}`,
                                ),
                              ),
                              concatMap((response) => {
                                const renamedFile = response?.content?.find(
                                  (item) =>
                                    item.fileName ===
                                    `Renamed-Copy-${copiedFile.fileName}`,
                                );
                                if (renamedFile === undefined) {
                                  return throwError(() => [
                                    ...testResults,
                                    {
                                      title: 'Rename file',
                                      description: `Check if file was renamed to "Renamed-Copy-${copiedFile.fileName}"`,
                                      response: response,
                                      errorText:
                                        'Cant execute next tests without renamed file',
                                      result: TestResult.FAIL,
                                    },
                                  ]);
                                }
                                return of([
                                  ...testResults,
                                  {
                                    title: 'Rename file',
                                    description: `Check if file ${copiedFile.fileName} was renamed to "Renamed-Copy-${copiedFile.fileName}"`,
                                    response: response.content,
                                    result: TestResult.OK,
                                  },
                                ]);
                              }),
                            ),
                        ),
                      ),
                  ),
                ),
            ),
          );
      }),
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
    );
  }
}
