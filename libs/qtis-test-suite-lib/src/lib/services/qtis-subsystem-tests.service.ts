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
import { ExplorerRequestActions } from '@eustrosoft-front/explorer-lib';
import { TestObs } from '../interfaces/test-obs.interface';
import { QtisTestsService } from './qtis-tests.service';
import { flattenArray } from '../functions/flatten-array.function';

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
    // const uploadedFileName = `${dateNow}-${testData.fileName}`;
    const folderPath = `${testData.folderForTests}/${testsFolderName}`;
    // const fileUploadPath = `${testData.folderForTests}/${testsFolderName}/${firstNestedFolderName}`;
    /** TODO Сценарий с пустыми папками
     *   + Создать 3 пустые папки
     *   Переименовать первую папку
     *   Скопировать первую папку во вторую папку
     *   Переименовать скопированную папку (сделать ей имя `${nestedFolderName}-4`) во второй папке
     *   Переместить переименованную папку в testsFolderName
     *   Удалить папку `${nestedFolderName}-4` (над которой было много манипуляций)
     *   Удалить папку `${nestedFolderName}-3` (над которой не было манипуляций)
     *   Удалить папку `${nestedFolderName}-2` (в которую копировали)
     */
    return this.qtisTestsService.login(testData.login, testData.password).pipe(
      concatMap((testResults) => {
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
        ]);
      }),
      concatMap(([testResults, [createDirResult]]) => {
        return combineLatest([
          of([testResults, createDirResult]),
          this.qtisTestsService
            .createDir(
              folderPath,
              firstNestedFolderName,
              testData.folderDescription,
              testData.folderSecurityLevel.toString(),
            )
            .pipe(
              catchError((err: TestCaseResult[]) =>
                throwError(() => [...testResults, err]),
              ),
            ),
        ]);
      }),
      concatMap(([testResults, [createDirTestResults, firstNestedFolder]]) => {
        testResults.push(createDirTestResults);
        return combineLatest([
          of(testResults),
          of(firstNestedFolder),
          this.qtisTestsService
            .createDir(
              folderPath,
              secondNestedFolderName,
              testData.folderDescription,
              testData.folderSecurityLevel.toString(),
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
          firstNestedFolder,
          [createDirTestResults, secondNestedFolder],
        ]) => {
          testResults.push(createDirTestResults);
          return combineLatest([
            of(testResults),
            of(firstNestedFolder),
            of(secondNestedFolder),
            this.qtisTestsService
              .createDir(
                folderPath,
                thirdNestedFolderName,
                testData.folderDescription,
                testData.folderSecurityLevel.toString(),
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
          [createDirTestResults, thirdNestedFolderName],
        ]) => {
          testResults.push(createDirTestResults);
          return combineLatest([
            of(testResults),
            of(firstNestedFolder),
            of(secondNestedFolder),
            of(thirdNestedFolderName),
            this.qtisTestsService
              .copyMove(
                [firstNestedFolder],
                [
                  `${secondNestedFolder.fullPath}/${firstNestedFolder.fileName}`,
                ],
                ExplorerRequestActions.COPY,
                secondNestedFolder.fullPath,
                firstNestedFolder.fileName,
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
          thirdNestedFolderName,
          [copyDirTestResults, copiedFirstNestedFolder],
        ]) => {
          testResults.push(copyDirTestResults);
          return combineLatest([
            of(testResults),
            of(firstNestedFolder),
            of(secondNestedFolder),
            of(thirdNestedFolderName),
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
          thirdNestedFolderName,
          _fourthNestedFolderName,
          [renameDirTestResults, renamedToFourthNestedFolderName],
        ]) => {
          testResults.push(renameDirTestResults);
          return combineLatest([
            of(testResults),
            of(firstNestedFolder),
            of(secondNestedFolder),
            of(thirdNestedFolderName),
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
          thirdNestedFolderName,
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
                  thirdNestedFolderName,
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
      // concatMap(
      //   ([testResults, [createDirTestResults, copiedFirstNestedFolder]]) => {
      //     testResults.push(createDirTestResults);
      //     if (testData.files.length === 0) {
      //       return throwError(() => [
      //         ...testResults,
      //         {
      //           title: 'Upload file',
      //           description: 'Upload file to folder',
      //           errorText:
      //             'Cant proceed without a file. Attach a file in Data For Tests tab',
      //           result: TestResult.FAIL,
      //         },
      //       ]);
      //     }
      //     return combineLatest([
      //       of(testResults),
      //       this.qtisTestsService
      //         .uploadFile(
      //           testData.files,
      //           fileUploadPath,
      //           testData.fileName,
      //           <SecurityLevels>testData.folderSecurityLevel.toString(),
      //           testData.fileDescription,
      //           uploadedFileName,
      //         )
      //         .pipe(
      //           catchError((err: TestCaseResult[]) =>
      //             throwError(() => [...testResults, err]),
      //           ),
      //         ),
      //     ]);
      //   },
      // ),
      // concatMap(([testResults, [uploadFileTestResults, content]]) => {
      //   testResults.push(uploadFileTestResults);
      //   return combineLatest([
      //     of(testResults),
      //     this.qtisTestsService
      //       .copyMove(
      //         content ?? [],
      //         [`${folderPath}/${uploadedFileName}`],
      //         ExplorerRequestActions.COPY,
      //         folderPath,
      //         uploadedFileName,
      //       )
      //       .pipe(
      //         catchError((err: TestCaseResult[]) =>
      //           throwError(() => [...testResults, err]),
      //         ),
      //       ),
      //   ]);
      // }),
      // concatMap(([testResults, [copyFileTestResults, copiedFile]]) => {
      //   testResults.push(copyFileTestResults);
      //   return combineLatest([
      //     of(testResults),
      //     this.qtisTestsService
      //       .rename(
      //         copiedFile,
      //         `Renamed-Copy-${copiedFile.fileName}`,
      //         `Updated ${testData.fileDescription}`,
      //         folderPath,
      //       )
      //       .pipe(
      //         catchError((err: TestCaseResult[]) =>
      //           throwError(() => [...testResults, err]),
      //         ),
      //       ),
      //   ]);
      // }),
      concatMap(([testResults, _, deleteTestResults]) => {
        testResults.push(deleteTestResults);
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
    ) as Observable<TestObs>;
    // Used "as" because rxjs got hard time recognizing types from combineLatest() generic params and casts everything to Observable<unknown>, which is bs
  }
}
