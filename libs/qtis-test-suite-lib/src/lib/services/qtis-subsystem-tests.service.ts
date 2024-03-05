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
import { SecurityLevels } from '@eustrosoft-front/security';
import { TestCaseResult } from '../interfaces/test-case-result.interface';
import { ExplorerRequestActions } from '@eustrosoft-front/explorer-lib';
import { TestObs } from '../interfaces/test-obs.interface';
import { QtisTestsService } from './qtis-tests.service';
import { TestResult } from '../interfaces/test-case.interface';
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

  fsTests$ = merge(
    this.runFsTests$().pipe(startWith(undefined)),
    this.runAllTests$().pipe(startWith(undefined)),
  ).pipe(
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
    const dateNow = Date.now();
    const folderName = `test-folder-${dateNow}`;
    const nestedFolderName = `nested-folder-${dateNow}`;
    const uploadedFileName = `${dateNow}-${testData.fileName}`;
    const folderPath = `${testData.folderForTests}/${folderName}`;
    const fileUploadPath = `${testData.folderForTests}/${folderName}/${nestedFolderName}`;

    return this.qtisTestsService.login(testData.login, testData.password).pipe(
      concatMap((testResults) => {
        return combineLatest([
          of(testResults),
          this.qtisTestsService
            .createDir(
              testData.folderForTests,
              folderName,
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
        return combineLatest([
          of(testResults),
          this.qtisTestsService
            .createDir(
              folderPath,
              nestedFolderName,
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
      concatMap(([testResults, createDirTestResults]) => {
        testResults.push(createDirTestResults);
        return combineLatest([
          of(testResults),
          this.qtisTestsService
            .uploadFile(
              testData.files,
              fileUploadPath,
              testData.fileName,
              <SecurityLevels>testData.folderSecurityLevel.toString(),
              testData.fileDescription,
              uploadedFileName,
            )
            .pipe(
              catchError((err: TestCaseResult[]) =>
                throwError(() => [...testResults, err]),
              ),
            ),
        ]);
      }),
      concatMap(([testResults, [uploadFileTestResults, content]]) => {
        testResults.push(uploadFileTestResults);
        return combineLatest([
          of(testResults),
          this.qtisTestsService
            .copy(
              content ?? [],
              [`${folderPath}/${uploadedFileName}`],
              ExplorerRequestActions.COPY,
              folderPath,
              uploadedFileName,
            )
            .pipe(
              catchError((err: TestCaseResult[]) =>
                throwError(() => [...testResults, err]),
              ),
            ),
        ]);
      }),
      concatMap(([testResults, [copyFileTestResults, copiedFile]]) => {
        testResults.push(copyFileTestResults);
        return combineLatest([
          of(testResults),
          this.qtisTestsService
            .rename(
              copiedFile,
              `Renamed-Copy-${copiedFile.fileName}`,
              `Updated ${testData.fileDescription}`,
              folderPath,
            )
            .pipe(
              catchError((err: TestCaseResult[]) =>
                throwError(() => [...testResults, err]),
              ),
            ),
        ]);
      }),
      concatMap(([testResults, [renameFileTestResults]]) => {
        testResults.push(renameFileTestResults);
        const results = flattenArray(testResults);
        console.log(results);
        return of({
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
        return of({
          isLoading: false,
          isError: true,
          results: res,
        });
      }),
    );
  }
}
