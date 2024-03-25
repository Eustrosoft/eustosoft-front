import { inject, Injectable } from '@angular/core';
import { QtisTestFormService } from './qtis-test-form.service';
import {
  catchError,
  combineLatest,
  concatMap,
  filter,
  interval,
  map,
  merge,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  throwError,
} from 'rxjs';
import { TestCaseResult } from '../interfaces/test-case-result.interface';
import {
  ExplorerRequestActions,
  FileSystemObject,
} from '@eustrosoft-front/explorer-lib';
import { TestObs } from '../interfaces/test-obs.interface';
import { QtisTestsService } from './qtis-tests.service';
import { flattenArray } from '../functions/flatten-array.function';
import { TestResult } from '../interfaces/test-case.interface';
import { SamService, SecurityLevels } from '@eustrosoft-front/security';
import { QtisErrorCodes } from '@eustrosoft-front/core';
import { MsgChatStatus, MsgService } from '@eustrosoft-front/msg-lib';

@Injectable({
  providedIn: 'root',
})
export class QtisSubsystemTestsService {
  private readonly qtisTestFormService = inject(QtisTestFormService);
  private readonly qtisTestsService = inject(QtisTestsService);
  private readonly samService = inject(SamService);
  private readonly msgService = inject(MsgService);
  private readonly runAllTestsSubject = new Subject<void>();
  private readonly runFsTestsSubject = new Subject<void>();
  private readonly runMsgTestsSubject = new Subject<void>();
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

  fsTests$ = merge(this.runFsTests$(), this.runAllTests$()).pipe(
    switchMap(() => this.executeFsTests$()),
    shareReplay(1),
  );

  msgTests$ = merge(this.runMsgTests$(), this.runAllTests$()).pipe(
    switchMap(() => this.executeMsgTests$()),
    shareReplay(1),
  );

  getPhraseObservable(): Observable<string> {
    return interval(2000).pipe(
      startWith(0),
      map(() => this.phrases[Math.floor(Math.random() * this.phrases.length)]),
    );
  }

  runAllTests(): void {
    this.runAllTestsSubject.next();
  }

  runAllTests$(): Observable<void> {
    return this.runAllTestsSubject.asObservable();
  }

  runFsTests(): void {
    this.runFsTestsSubject.next();
  }

  runFsTests$(): Observable<void> {
    return this.runFsTestsSubject.asObservable();
  }

  runMsgTests(): void {
    this.runMsgTestsSubject.next();
  }

  runMsgTests$(): Observable<void> {
    return this.runMsgTestsSubject.asObservable();
  }

  private executeFsTests$(): Observable<TestObs> {
    const testData = this.qtisTestFormService.form.getRawValue();
    const dateNow = this.qtisTestsService.getFormattedDate();
    const testsFolderName = `test-folder-${dateNow}`;
    const nestedFolderName = `nested-folder-${dateNow}`;
    const firstNestedFolderName = `1-${nestedFolderName}`;
    const secondNestedFolderName = `2-${nestedFolderName}`;
    const thirdNestedFolderName = `3-${nestedFolderName}`;
    const fourthNestedFolderName = `4-${nestedFolderName}`;
    const uploadedFileName = `${dateNow}-${testData.fileName}`;
    const folderPath = `${testData.folderForTests}/${testsFolderName}`;

    return this.qtisTestsService.login$(testData.login, testData.password).pipe(
      concatMap((testResults) => {
        testResults.push({
          title: 'BEGIN EMPTY FOLDER TESTS',
          description: '',
          response: {},
          hideToggle: true,
          result: TestResult.NONE,
        });
        return this.emptyFolderTests$(
          testResults,
          testData,
          testsFolderName,
          folderPath,
          firstNestedFolderName,
          secondNestedFolderName,
          thirdNestedFolderName,
          fourthNestedFolderName,
        );
      }),
      concatMap(([testResults, firstNestedFolder]) => {
        testResults.push([
          {
            title: 'END EMPTY FOLDER TESTS',
            description: '',
            response: {},
            hideToggle: true,
            result: TestResult.NONE,
          },
        ]);
        testResults.push([
          {
            title: 'BEGIN NOT EMPTY FOLDER TESTS',
            description: '',
            response: {},
            hideToggle: true,
            result: TestResult.NONE,
          },
        ]);
        return this.notEmptyFolderTests$(
          testResults,
          testData,
          folderPath,
          firstNestedFolder,
          secondNestedFolderName,
          thirdNestedFolderName,
          fourthNestedFolderName,
          uploadedFileName,
        );
      }),
      concatMap(
        ([
          [testResults, firstNestedFolder],
          nestedFirstInFirst,
          fileUploadedToFirstFolder,
        ]) => {
          testResults.push([
            {
              title: 'END NOT EMPTY FOLDER TESTS',
              description: '',
              response: {},
              hideToggle: true,
              result: TestResult.NONE,
            },
          ]);
          testResults.push([
            {
              title: 'BEGIN FILE TESTS',
              description: '',
              response: {},
              hideToggle: true,
              result: TestResult.NONE,
            },
          ]);
          return this.fileTests$(
            testResults,
            firstNestedFolder,
            nestedFirstInFirst,
            fileUploadedToFirstFolder,
            folderPath,
          );
        },
      ),
      concatMap(
        ([testResults, fileUploadedToFirstFolder, firstNestedFolder]) => {
          testResults.push([
            {
              title: 'END FILE TESTS',
              description: '',
              response: {},
              hideToggle: true,
              result: TestResult.NONE,
            },
          ]);
          testResults.push([
            {
              title: 'BEGIN NEGATIVE TESTS',
              description: '',
              response: {},
              hideToggle: true,
              result: TestResult.NONE,
            },
          ]);
          return this.negativeTests$(
            testResults,
            firstNestedFolder,
            fileUploadedToFirstFolder,
            folderPath,
            testData.files,
          );
        },
      ),
      concatMap((testResults) => {
        testResults.push([
          {
            title: 'END NEGATIVE TESTS',
            description: '',
            response: {},
            hideToggle: true,
            result: TestResult.NONE,
          },
        ]);
        const results = flattenArray(testResults);
        return of<TestObs>({
          isLoading: false,
          isError: false,
          results,
        });
      }),
      startWith<TestObs>({
        isLoading: true,
        isError: false,
        results: undefined,
      }),
      catchError((results: TestCaseResult[]) => {
        const res = flattenArray(results);
        return of<TestObs>({
          isLoading: false,
          isError: true,
          results: res,
        });
      }),
    );
  }

  private executeMsgTests$(): Observable<TestObs> {
    const testData = this.qtisTestFormService.form.getRawValue();
    const dateNow = this.qtisTestsService.getFormattedDate();
    const chatName = `${testData.chatName}-${dateNow}`;
    const firstChatName = `1-${chatName}`;
    const secondChatName = `2-${chatName}`;
    const thirdChatName = `3-${chatName}`;
    // const fourthChatName = `4-${chatName}`;
    return combineLatest([
      this.qtisTestsService.login$(testData.login, testData.password),
      this.samService
        .getUserDefaultScope()
        .pipe(map((data) => +data.r.flatMap((val) => val.data).pop()!)),
      this.samService
        .getUserSlvl()
        .pipe(map((data) => +data.r.flatMap((val) => val.data).pop()!)),
    ]).pipe(
      concatMap(([testResults, defaultScope, defaultSlvl]) => {
        return combineLatest([
          of([testResults]),
          this.qtisTestsService.createChat$(
            testResults,
            defaultScope,
            defaultSlvl,
            {
              subject: firstChatName,
              message: testData.chatInitialMessage,
              securityLevel: testData.chatSecurityLevel.toString(),
              scope: testData.chatScopeId,
            },
          ),
          this.qtisTestsService.createChat$(
            testResults,
            defaultScope,
            defaultSlvl,
            {
              subject: secondChatName,
              message: '',
              securityLevel: testData.chatSecurityLevel.toString(),
              scope: undefined,
            },
          ),
          this.qtisTestsService.createChat$(
            testResults,
            defaultScope,
            defaultSlvl,
            {
              subject: thirdChatName,
              message: '',
              securityLevel: undefined,
              scope: undefined,
            },
          ),
        ]).pipe(
          concatMap(
            ([
              testResults,
              [
                _tr,
                createFirstChatTestResult,
                checkFirstChatVersionTestResult,
                firstCreatedChat,
              ],
              [
                _tr2,
                createSecondChatTestResult,
                checkSecondChatVersionTestResult,
                secondCreatedChat,
              ],
              [
                _tr3,
                createThirdChatTestResult,
                checkThirdChatVersionTestResult,
                _thirdCreatedChat,
              ],
            ]) => {
              testResults.push(
                createFirstChatTestResult,
                checkFirstChatVersionTestResult,
                createSecondChatTestResult,
                checkSecondChatVersionTestResult,
                createThirdChatTestResult,
                checkThirdChatVersionTestResult,
              );
              return combineLatest([
                of(testResults),
                this.qtisTestsService.changeChatStatus$(
                  firstCreatedChat,
                  MsgChatStatus.CLOSED,
                ),
                this.qtisTestsService.changeChatStatus$(
                  secondCreatedChat,
                  MsgChatStatus.WIP,
                ),
              ]).pipe(
                concatMap(
                  ([
                    testResults,
                    [
                      changeFirstChatTestResult,
                      checkFirstChatVersionTestResult,
                      firstChatWithChangedStatus,
                    ],
                    [
                      changeSecondChatTestResult,
                      checkSecondChatVersionTestResult,
                      secondChatWithChangedStatus,
                    ],
                  ]) => {
                    testResults.push(
                      changeFirstChatTestResult,
                      checkFirstChatVersionTestResult,
                      changeSecondChatTestResult,
                      checkSecondChatVersionTestResult,
                    );
                    return combineLatest([
                      of(testResults),
                      this.msgService
                        .getChats$([MsgChatStatus.CLOSED, MsgChatStatus.WIP])
                        .pipe(
                          catchError(() =>
                            throwError(() => [
                              ...testResults,
                              {
                                title: 'Error getting filtered chat list',
                                description: '',
                                errorText: `Cant get list of chats with status filter ${[
                                  MsgChatStatus.CLOSED,
                                  MsgChatStatus.WIP,
                                ].toString()}`,
                                result: TestResult.FAIL,
                              },
                            ]),
                          ),
                          filter((chats) => !chats.isLoading),
                        ),
                    ]).pipe(
                      concatMap(([testResults, response]) => {
                        const chatNames = response.chats!.map(
                          (chat) => chat.subject,
                        );
                        const firstInListWithCorrectStatus =
                          chatNames.includes(
                            firstChatWithChangedStatus.subject,
                          ) &&
                          firstChatWithChangedStatus.status ===
                            MsgChatStatus.CLOSED;

                        const secondInListWithCorrectStatus =
                          chatNames.includes(
                            secondChatWithChangedStatus.subject,
                          ) &&
                          secondChatWithChangedStatus.status ===
                            MsgChatStatus.WIP;

                        return combineLatest([
                          of(testResults),
                          of([
                            {
                              title: 'Check if CLOSED chat had been filtered',
                              description: `Check if chat ${firstChatWithChangedStatus.subject} is in list`,
                              response: response.chats,
                              result: firstInListWithCorrectStatus
                                ? TestResult.OK
                                : TestResult.FAIL,
                            },
                            {
                              title: 'Check if WIP chat had been filtered',
                              description: `Check if chat ${secondChatWithChangedStatus.subject} is in list`,
                              response: response.chats,
                              result: secondInListWithCorrectStatus
                                ? TestResult.OK
                                : TestResult.FAIL,
                            },
                            {
                              title:
                                'Check that filtered list dont contain chats with NEW status',
                              description: `Check if chat ${firstCreatedChat.subject} is in list`,
                              response: response.chats,
                              result: response.chats!.some(
                                (chat) => chat.status === MsgChatStatus.NEW,
                              )
                                ? TestResult.FAIL
                                : TestResult.OK,
                            },
                          ]),
                        ]);
                      }),
                    );
                  },
                ),
                concatMap(([testResults, filterTestResults]) => {
                  testResults.push(filterTestResults);
                  return of(testResults);
                }),
              );
            },
          ),
        );
      }),
      concatMap((testResults) => {
        const results = flattenArray(testResults);
        return of<TestObs>({
          isLoading: false,
          isError: false,
          results,
        });
      }),
      startWith<TestObs>({
        isLoading: true,
        isError: false,
        results: undefined,
      }),
      catchError((results: TestCaseResult[]) => {
        const res = flattenArray(results);
        return of<TestObs>({
          isLoading: false,
          isError: true,
          results: res,
        });
      }),
    );
  }

  private emptyFolderTests$(
    testResults: TestCaseResult[],
    testData: ReturnType<typeof this.qtisTestFormService.form.getRawValue>,
    testsFolderName: string,
    folderPath: string,
    firstNestedFolderName: string,
    secondNestedFolderName: string,
    thirdNestedFolderName: string,
    fourthNestedFolderName: string,
  ): Observable<[TestCaseResult[][], FileSystemObject]> {
    return combineLatest([
      of(testResults),
      this.qtisTestsService
        .createDir$(
          testData.folderForTests,
          testsFolderName,
          testData.folderDescription,
          testData.folderSecurityLevel.toString(),
        )
        .pipe(
          catchError((err: TestCaseResult[]) =>
            throwError(() => [...testResults, err]),
          ),
        ),
    ]).pipe(
      concatMap(([testResults, [createDirResult]]) => {
        return combineLatest([
          of([testResults, createDirResult]),
          this.qtisTestsService.createDir$(
            folderPath,
            firstNestedFolderName,
            testData.folderDescription,
            testData.folderSecurityLevel.toString(),
          ),
          this.qtisTestsService.createDir$(
            folderPath,
            secondNestedFolderName,
            testData.folderDescription,
            testData.folderSecurityLevel.toString(),
          ),
          this.qtisTestsService.createDir$(
            folderPath,
            thirdNestedFolderName,
            testData.folderDescription,
            testData.folderSecurityLevel.toString(),
          ),
        ]).pipe(
          catchError((err: TestCaseResult[]) =>
            throwError(() => [...testResults, err]),
          ),
        );
      }),
      concatMap(
        ([
          testResults,
          [createFirstNestedTestResults, firstNestedFolder],
          [createSecondNestedTestResults, secondNestedFolder],
          [createThirdNestedTestResults, thirdNestedFolder],
        ]) => {
          testResults.push(createFirstNestedTestResults);
          testResults.push(createSecondNestedTestResults);
          testResults.push(createThirdNestedTestResults);
          return this.sharedTests$(
            testResults,
            firstNestedFolder,
            secondNestedFolder,
            thirdNestedFolder,
            fourthNestedFolderName,
            folderPath,
          );
        },
      ),
    );
  }

  private notEmptyFolderTests$(
    testResults: TestCaseResult[][],
    testData: ReturnType<typeof this.qtisTestFormService.form.getRawValue>,
    folderPath: string,
    firstNestedFolder: FileSystemObject,
    secondNestedFolderName: string,
    thirdNestedFolderName: string,
    fourthNestedFolderName: string,
    uploadedFileName: string,
  ): Observable<
    [[TestCaseResult[][], FileSystemObject], FileSystemObject, FileSystemObject]
  > {
    const nestedFirstInFirstName = `1-${firstNestedFolder.fileName}`;
    const nestedSecondInSecond = `2-${secondNestedFolderName}`;
    const nestedThirdInThird = `3-${thirdNestedFolderName}`;
    return combineLatest([
      of(testResults),
      of(firstNestedFolder).pipe(
        concatMap(() =>
          this.qtisTestsService
            .createDir$(
              `${folderPath}/${firstNestedFolder.fileName}`,
              nestedFirstInFirstName,
              testData.folderDescription,
              testData.folderSecurityLevel.toString(),
            )
            .pipe(
              concatMap(([createDirTestResults, nestedFirstInFirst]) =>
                combineLatest([
                  of(firstNestedFolder),
                  of(createDirTestResults),
                  of(nestedFirstInFirst),
                ]),
              ),
              catchError((err: TestCaseResult[]) =>
                throwError(() => [...testResults, err]),
              ),
            ),
        ),
      ),
      this.qtisTestsService
        .createDir$(
          folderPath,
          secondNestedFolderName,
          testData.folderDescription,
          testData.folderSecurityLevel.toString(),
        )
        .pipe(
          concatMap(([createDirTestResults, secondNestedFolder]) =>
            this.qtisTestsService
              .createDir$(
                `${folderPath}/${secondNestedFolderName}`,
                nestedSecondInSecond,
                testData.folderDescription,
                testData.folderSecurityLevel.toString(),
              )
              .pipe(
                concatMap(
                  ([createNestedDirTestResults, nestedSecondInSecond]) =>
                    combineLatest([
                      of(secondNestedFolder),
                      of(createDirTestResults),
                      of(nestedSecondInSecond),
                      of(createNestedDirTestResults),
                    ]),
                ),
                catchError((err: TestCaseResult[]) =>
                  throwError(() => [...testResults, err]),
                ),
              ),
          ),
          catchError((err: TestCaseResult[]) =>
            throwError(() => [...testResults, err]),
          ),
        ),
      this.qtisTestsService
        .createDir$(
          folderPath,
          thirdNestedFolderName,
          testData.folderDescription,
          testData.folderSecurityLevel.toString(),
        )
        .pipe(
          concatMap(([createDirTestResults, thirdNestedFolder]) =>
            this.qtisTestsService
              .createDir$(
                `${folderPath}/${thirdNestedFolderName}`,
                nestedThirdInThird,
                testData.folderDescription,
                testData.folderSecurityLevel.toString(),
              )
              .pipe(
                concatMap(([createNestedDirTestResults, nestedThirdInThird]) =>
                  combineLatest([
                    of(thirdNestedFolder),
                    of(createDirTestResults),
                    of(nestedThirdInThird),
                    of(createNestedDirTestResults),
                  ]),
                ),
                catchError((err: TestCaseResult[]) =>
                  throwError(() => [...testResults, err]),
                ),
              ),
          ),
          catchError((err: TestCaseResult[]) =>
            throwError(() => [...testResults, err]),
          ),
        ),
    ]).pipe(
      concatMap(
        ([
          testResults,
          [
            firstNestedFolder,
            createNestedFirstInFirstTestResults,
            nestedFirstInFirst,
          ],
          [
            secondNestedFolder,
            createSecondNestedTestResults,
            _nestedSecondInSecond,
            createNestedSecondInSecondTestResults,
          ],
          [
            thirdNestedFolder,
            createThirdNestedTestResults,
            _nestedThirdInThird,
            createNestedThirdInThirdTestResults,
          ],
        ]) => {
          testResults.push(createNestedFirstInFirstTestResults);
          testResults.push(createSecondNestedTestResults);
          testResults.push(createNestedSecondInSecondTestResults);
          testResults.push(createThirdNestedTestResults);
          testResults.push(createNestedThirdInThirdTestResults);
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
          // Upload to first, copy to second and third
          return combineLatest([
            of(testResults),
            of(firstNestedFolder),
            of(nestedFirstInFirst),
            of(secondNestedFolder),
            of(thirdNestedFolder),
            this.qtisTestsService
              .uploadFile$(
                testData.files,
                firstNestedFolder.fullPath,
                testData.fileName,
                <SecurityLevels>testData.folderSecurityLevel.toString(),
                testData.fileDescription,
                uploadedFileName,
              )
              .pipe(
                concatMap(([fileUploadTestResults, folderContent]) => {
                  testResults.push(fileUploadTestResults);
                  return combineLatest([
                    of(folderContent![1]),
                    this.qtisTestsService.copyMoveFsObject$(
                      [folderContent![1]],
                      [
                        `${secondNestedFolder.fullPath}/${
                          folderContent![1].fileName
                        }`,
                      ],
                      ExplorerRequestActions.COPY,
                      secondNestedFolder.fullPath,
                      folderContent![1].fileName,
                    ),
                    this.qtisTestsService.copyMoveFsObject$(
                      [folderContent![1]],
                      [
                        `${thirdNestedFolder.fullPath}/${
                          folderContent![1].fileName
                        }`,
                      ],
                      ExplorerRequestActions.COPY,
                      thirdNestedFolder.fullPath,
                      folderContent![1].fileName,
                    ),
                  ]).pipe(
                    catchError((err: TestCaseResult[]) =>
                      throwError(() => [...testResults, err]),
                    ),
                  );
                }),
                catchError((err: TestCaseResult[]) =>
                  throwError(() => [...testResults, err]),
                ),
              ),
          ]);
        },
      ),
      concatMap(
        ([
          testResults,
          firstNestedFolder,
          nestedFirstInFirst,
          secondNestedFolder,
          thirdNestedFolder,
          [
            fileUploadedToFirstFolder,
            [copyToSecondTestResults, _copiedToSecond],
            [copyToThirdTestResults, _copiedToThird],
          ],
        ]) => {
          testResults.push(copyToSecondTestResults);
          testResults.push(copyToThirdTestResults);
          return combineLatest([
            this.sharedTests$(
              testResults,
              firstNestedFolder,
              secondNestedFolder,
              thirdNestedFolder,
              fourthNestedFolderName,
              folderPath,
            ),
            of(nestedFirstInFirst),
            of(fileUploadedToFirstFolder),
          ]);
        },
      ),
    );
  }

  private fileTests$(
    testResults: TestCaseResult[][],
    firstNestedFolder: FileSystemObject,
    nestedFirstInFirst: FileSystemObject,
    fileUploadedToFirstFolder: FileSystemObject,
    folderPath: string,
  ): Observable<[TestCaseResult[][], FileSystemObject, FileSystemObject]> {
    return combineLatest([
      of(testResults),
      this.qtisTestsService
        .copyMoveFsObject$(
          [fileUploadedToFirstFolder],
          [`${folderPath}/${fileUploadedToFirstFolder.fileName}`],
          ExplorerRequestActions.COPY,
          folderPath,
          fileUploadedToFirstFolder.fileName,
        )
        .pipe(
          catchError((err: TestCaseResult[]) =>
            throwError(() => [...testResults, err]),
          ),
        ),
    ]).pipe(
      concatMap(([testResults, [copyFileTestResults, copiedFile]]) => {
        testResults.push(copyFileTestResults);
        return combineLatest([
          of(testResults),
          this.qtisTestsService
            .renameFsObject$(
              copiedFile,
              `Renamed-Copy-${copiedFile.fileName}`,
              `Updated ${copiedFile.description}`,
              folderPath,
            )
            .pipe(
              catchError((err: TestCaseResult[]) =>
                throwError(() => [...testResults, err]),
              ),
            ),
        ]);
      }),
      concatMap(([testResults, [renameFileTestResults, renamedFile]]) => {
        testResults.push(renameFileTestResults);
        return combineLatest([
          of(testResults),
          this.qtisTestsService
            .copyMoveFsObject$(
              [renamedFile],
              [
                `${folderPath}/${firstNestedFolder.fileName}/${renamedFile.fileName}`,
              ],
              ExplorerRequestActions.MOVE,
              `${folderPath}/${firstNestedFolder.fileName}`,
              renamedFile.fileName,
            )
            .pipe(
              concatMap(([moveTestResults, movedRenamedFile]) => {
                testResults.push(moveTestResults);
                return combineLatest([
                  of(testResults),
                  of(movedRenamedFile),
                  of(fileUploadedToFirstFolder),
                  this.qtisTestsService
                    .deleteFsObject$(
                      [fileUploadedToFirstFolder],
                      `${folderPath}/${firstNestedFolder.fileName}`,
                    )
                    .pipe(
                      catchError((err: TestCaseResult[]) =>
                        throwError(() => [...testResults, err]),
                      ),
                    ),
                ]);
              }),
              concatMap(
                ([
                  testResults,
                  movedRenamedFile,
                  fileUploadedToFirstFolder,
                  deleteTestResults,
                ]) => {
                  testResults.push(deleteTestResults);
                  return combineLatest([
                    of(testResults),
                    this.qtisTestsService
                      .renameFsObject$(
                        movedRenamedFile,
                        fileUploadedToFirstFolder.fileName,
                        fileUploadedToFirstFolder.description,
                        `${folderPath}/${firstNestedFolder.fileName}`,
                      )
                      .pipe(
                        catchError((err: TestCaseResult[]) =>
                          throwError(() => [...testResults, err]),
                        ),
                      ),
                  ]);
                },
              ),
              catchError((err: TestCaseResult[]) =>
                throwError(() => [...testResults, err]),
              ),
            ),
        ]);
      }),
      concatMap(
        ([
          testResults,
          [_moveTestResults, [renameTestResults, renamedFile]],
        ]) => {
          testResults.push(renameTestResults);
          return combineLatest([
            of(testResults),
            of(renamedFile),
            of(firstNestedFolder),
          ]);
        },
      ),
    );
  }

  private negativeTests$(
    testResults: TestCaseResult[][],
    firstNestedFolder: FileSystemObject,
    fileUploadedToFirstFolder: FileSystemObject,
    folderPath: string,
    files: File[],
  ): Observable<TestCaseResult[][]> {
    return combineLatest([
      of(testResults),
      this.qtisTestsService
        .createDir$(
          folderPath,
          firstNestedFolder.fileName,
          firstNestedFolder.description,
          firstNestedFolder.securityLevel.value!.toString(),
        )
        .pipe(
          catchError((err: TestCaseResult[]) => {
            const { response, responseStatus } = err[0];
            const responseIsString = typeof response === 'string';
            if (
              responseIsString &&
              response.includes(QtisErrorCodes.DuplicatedRecord)
            ) {
              testResults.push([
                {
                  title: `Error creating duplicate folder ${firstNestedFolder.fileName}`,
                  description: '',
                  responseStatus: responseStatus,
                  response: response,
                  errorText: '',
                  result: TestResult.OK,
                },
              ]);
              return of(testResults);
            }
            testResults.push([
              {
                title: `Error creating duplicate folder ${firstNestedFolder.fileName}`,
                description: '',
                responseStatus: responseStatus,
                response: response,
                errorText: '',
                result: TestResult.BACKEND_ERROR,
              },
            ]);
            return of(testResults);
          }),
        ),
      this.qtisTestsService
        .uploadFile$(
          files,
          `${folderPath}/${firstNestedFolder.fileName}`,
          files[0].name,
          <SecurityLevels>(
            fileUploadedToFirstFolder.securityLevel.value!.toString()
          ),
          fileUploadedToFirstFolder.description,
          fileUploadedToFirstFolder.fileName,
        )
        .pipe(
          catchError((err: TestCaseResult[]) => {
            const { response, responseStatus } = err[0];
            const responseIsString = typeof response === 'string';
            if (
              responseIsString &&
              response.includes(QtisErrorCodes.DuplicatedRecord)
            ) {
              testResults.push([
                {
                  title: `Error uploading duplicate file ${fileUploadedToFirstFolder.fileName}`,
                  description: '',
                  responseStatus: responseStatus,
                  response: response,
                  errorText: '',
                  result: TestResult.OK,
                },
              ]);
              return of(testResults);
            }
            testResults.push([
              {
                title: `Error uploading duplicate file ${fileUploadedToFirstFolder.fileName}`,
                description: '',
                responseStatus: responseStatus,
                response: response,
                errorText: '',
                result: TestResult.BACKEND_ERROR,
              },
            ]);
            return of(testResults);
          }),
        ),
      this.qtisTestsService
        .copyMoveFsObject$(
          [firstNestedFolder],
          [firstNestedFolder.fullPath],
          ExplorerRequestActions.COPY,
          folderPath,
          firstNestedFolder.fileName,
        )
        .pipe(
          catchError((err: TestCaseResult[]) => {
            const { response, responseStatus } = err[0];
            const responseIsString = typeof response === 'string';
            if (
              responseIsString &&
              response.includes(QtisErrorCodes.DuplicatedRecord)
            ) {
              testResults.push([
                {
                  title: `Error creating duplicate folder ${firstNestedFolder.fileName} via copy`,
                  description: '',
                  responseStatus: responseStatus,
                  response: response,
                  errorText: '',
                  result: TestResult.OK,
                },
              ]);
              return of(testResults);
            }
            testResults.push([
              {
                title: `Error creating duplicate folder ${firstNestedFolder.fileName} via copy`,
                description: '',
                responseStatus: responseStatus,
                response: response,
                errorText: '',
                result: TestResult.BACKEND_ERROR,
              },
            ]);
            return of(testResults);
          }),
        ),
      this.qtisTestsService
        .createDir$(
          firstNestedFolder.fullPath,
          fileUploadedToFirstFolder.fileName,
          firstNestedFolder.description,
          firstNestedFolder.securityLevel.value!.toString(),
        )
        .pipe(
          catchError((err: TestCaseResult[]) => {
            const { response, responseStatus } = err[0];
            const responseIsString = typeof response === 'string';
            if (
              responseIsString &&
              response.includes(QtisErrorCodes.DuplicatedRecord)
            ) {
              testResults.push([
                {
                  title: `Error creating folder with name of existing file ${fileUploadedToFirstFolder.fileName}`,
                  description: '',
                  responseStatus: responseStatus,
                  response: response,
                  errorText: '',
                  result: TestResult.OK,
                },
              ]);
              return of(testResults);
            }
            testResults.push([
              {
                title: `Error creating folder with name of existing file ${fileUploadedToFirstFolder.fileName}`,
                description: '',
                responseStatus: responseStatus,
                response: response,
                errorText: '',
                result: TestResult.BACKEND_ERROR,
              },
            ]);
            return of(testResults);
          }),
        ),
    ]).pipe(concatMap(([testResults]) => of(testResults)));
  }

  private sharedTests$(
    testResults: TestCaseResult[][],
    firstNestedFolder: FileSystemObject,
    secondNestedFolder: FileSystemObject,
    thirdNestedFolder: FileSystemObject,
    fourthNestedFolderName: string,
    folderPath: string,
  ): Observable<[TestCaseResult[][], FileSystemObject]> {
    return combineLatest([
      of(testResults),
      of(firstNestedFolder),
      of(secondNestedFolder),
      of(thirdNestedFolder),
      this.qtisTestsService
        .copyMoveFsObject$(
          [firstNestedFolder],
          [`${secondNestedFolder.fullPath}/${firstNestedFolder.fileName}`],
          ExplorerRequestActions.COPY,
          secondNestedFolder.fullPath,
          firstNestedFolder.fileName,
        )
        .pipe(
          catchError((err: TestCaseResult[]) =>
            throwError(() => [...testResults, err]),
          ),
        ),
    ]).pipe(
      concatMap(
        ([
          testResults,
          firstNestedFolder,
          secondNestedFolder,
          thirdNestedFolder,
          [copyDirTestResults, copiedFirstNestedFolder],
        ]) => {
          testResults.push(copyDirTestResults);
          return combineLatest([
            of(testResults),
            of(firstNestedFolder),
            of(secondNestedFolder),
            of(thirdNestedFolder),
            of(copiedFirstNestedFolder),
            this.qtisTestsService
              .renameFsObject$(
                copiedFirstNestedFolder,
                fourthNestedFolderName,
                `Renamed ${copiedFirstNestedFolder.description}`,
                secondNestedFolder.fullPath,
              )
              .pipe(
                catchError((err: TestCaseResult[]) =>
                  throwError(() => [...testResults, err]),
                ),
              ),
          ]);
        },
      ),
      concatMap(
        ([
          testResults,
          firstNestedFolder,
          secondNestedFolder,
          thirdNestedFolder,
          _fourthNestedFolderName,
          [renameDirTestResults, renamedToFourthNestedFolderName],
        ]) => {
          testResults.push(renameDirTestResults);
          return combineLatest([
            of(testResults),
            of(firstNestedFolder),
            of(secondNestedFolder),
            of(thirdNestedFolder),
            of(renamedToFourthNestedFolderName),
            this.qtisTestsService
              .copyMoveFsObject$(
                [renamedToFourthNestedFolderName],
                [`${folderPath}/${renamedToFourthNestedFolderName.fileName}`],
                ExplorerRequestActions.MOVE,
                folderPath,
                renamedToFourthNestedFolderName.fileName,
              )
              .pipe(
                catchError((err: TestCaseResult[]) =>
                  throwError(() => [...testResults, err]),
                ),
              ),
          ]);
        },
      ),
      concatMap(
        ([
          testResults,
          firstNestedFolder,
          secondNestedFolder,
          thirdNestedFolder,
          _fourthNestedFolderName,
          [moveDirTestResults, movedAndRenamedToFourthNestedFolderName],
        ]) => {
          testResults.push(moveDirTestResults);
          return combineLatest([
            of(testResults),
            of(firstNestedFolder),
            this.qtisTestsService
              .deleteFsObject$(
                [
                  movedAndRenamedToFourthNestedFolderName,
                  thirdNestedFolder,
                  secondNestedFolder,
                ],
                folderPath,
              )
              .pipe(
                catchError((err: TestCaseResult[]) =>
                  throwError(() => [...testResults, err]),
                ),
              ),
          ]);
        },
      ),
      concatMap(([testResults, firstNestedFolder, deleteTestResults]) => {
        testResults.push(deleteTestResults);
        return combineLatest([of(testResults), of(firstNestedFolder)]);
      }),
    );
  }
}
