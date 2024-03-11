import { inject, Injectable } from '@angular/core';
import { QtisTestFormService } from './qtis-test-form.service';
import {
  catchError,
  combineLatest,
  concat,
  concatMap,
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
import { SecurityLevels } from '@eustrosoft-front/security';

@Injectable({
  providedIn: 'root',
})
export class QtisSubsystemTestsService {
  private readonly qtisTestFormService = inject(QtisTestFormService);
  private readonly qtisTestsService = inject(QtisTestsService);
  private readonly runAllTestsSubject = new Subject<void>();
  private readonly runFsTestsSubject = new Subject<void>();
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

  getPhraseObservable(): Observable<string> {
    return interval(2000).pipe(
      startWith(0),
      map(() => {
        const randomIndex = Math.floor(Math.random() * this.phrases.length);
        return this.phrases[randomIndex];
      }),
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

  executeAllTests$(): Observable<TestObs> {
    return concat(this.fsTests$);
  }

  executeFsTests$(): Observable<TestObs> {
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
    // const fileUploadPath = `${testData.folderForTests}/${testsFolderName}/${firstNestedFolderName}`;

    return this.qtisTestsService.login(testData.login, testData.password).pipe(
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
        console.log(results);
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

  emptyFolderTests$(
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
        .createDir(
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
          this.qtisTestsService.createDir(
            folderPath,
            firstNestedFolderName,
            testData.folderDescription,
            testData.folderSecurityLevel.toString(),
          ),
          this.qtisTestsService.createDir(
            folderPath,
            secondNestedFolderName,
            testData.folderDescription,
            testData.folderSecurityLevel.toString(),
          ),
          this.qtisTestsService.createDir(
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

  notEmptyFolderTests$(
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
            .createDir(
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
        .createDir(
          folderPath,
          secondNestedFolderName,
          testData.folderDescription,
          testData.folderSecurityLevel.toString(),
        )
        .pipe(
          concatMap(([createDirTestResults, secondNestedFolder]) =>
            this.qtisTestsService
              .createDir(
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
        .createDir(
          folderPath,
          thirdNestedFolderName,
          testData.folderDescription,
          testData.folderSecurityLevel.toString(),
        )
        .pipe(
          concatMap(([createDirTestResults, thirdNestedFolder]) =>
            this.qtisTestsService
              .createDir(
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
              .uploadFile(
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
                    this.qtisTestsService.copyMove(
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
                    this.qtisTestsService.copyMove(
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

  fileTests$(
    testResults: TestCaseResult[][],
    firstNestedFolder: FileSystemObject,
    nestedFirstInFirst: FileSystemObject,
    fileUploadedToFirstFolder: FileSystemObject,
    folderPath: string,
  ): Observable<[TestCaseResult[][], FileSystemObject, FileSystemObject]> {
    return combineLatest([
      of(testResults),
      this.qtisTestsService
        .copyMove(
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
            .rename(
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
            .copyMove(
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
                    .delete(
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
                      .rename(
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

  negativeTests$(
    testResults: TestCaseResult[][],
    _firstNestedFolder: FileSystemObject,
    _fileUploadedToFirstFolder: FileSystemObject,
  ): Observable<TestCaseResult[][]> {
    // TODO negative tests
    return of(testResults);
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
        .copyMove(
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
              .rename(
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
              .copyMove(
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
              .delete(
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
