import { inject, Injectable } from '@angular/core';
import { QtisTestFormService } from './qtis-test-form.service';
import {
  catchError,
  combineLatest,
  concat,
  concatMap,
  finalize,
  interval,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  throwError,
} from 'rxjs';
import { LoginService, SecurityLevels } from '@eustrosoft-front/security';
import { TestCaseResult } from '../interfaces/test-case-result.interface';
import {
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
import { DispatchService } from '@eustrosoft-front/core';
import { TestObs } from '../interfaces/test-obs.interface';
import { QtisTestsService } from './qtis-tests.service';
import { TestResult } from '../interfaces/test-case.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { flattenArray } from '../functions/flatten-array.function';

@Injectable({
  providedIn: 'root',
})
export class QtisSubsystemTestsService {
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
  private readonly qtisTestsService = inject(QtisTestsService);
  private readonly runAllTestsSubject = new Subject<void>();
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

  teardownUpload(): void {
    this.teardownUploadSubject.next();
  }

  executeAllTests(): Observable<TestObs> {
    return concat(this.executeFsTests$());
  }

  executeFsTests$(): Observable<TestObs> {
    // TODO
    // rename file in parent folder (bug, source file gets renamed, not copied one) -> move from child folder to parent -> delete original some file
    const testData = this.qtisTestFormService.form.getRawValue();
    const dateNow = Date.now();
    const folderName = `test-folder-${dateNow}`;
    const nestedFolderName = `nested-folder-${dateNow}`;
    const uploadedFileName = `${dateNow}-${testData.fileName}`;
    const folderPath = `${testData.folderForTests}/${folderName}`;
    const fileUploadPath = `${testData.folderForTests}/${folderName}/${nestedFolderName}`;

    return of(true).pipe(
      switchMap(() =>
        this.qtisTestsService.login(testData.login, testData.password),
      ),
      concatMap((testResults) => {
        return combineLatest([
          of(testResults),
          this.qtisTestsService.createDir(
            testData.folderForTests,
            folderName,
            testData.folderDescription,
            testData.folderSecurityLevel.toString(),
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
          this.qtisTestsService.createDir(
            folderPath,
            nestedFolderName,
            testData.folderDescription,
            testData.folderSecurityLevel.toString(),
          ),
        ]);
      }),
      concatMap((testResults) => {
        const formArray =
          this.explorerUploadItemFormFactoryService.makeUploadItemsForm(
            testData.files,
            fileUploadPath,
            <SecurityLevels>testData.folderSecurityLevel.toString(),
          );
        const control = formArray.controls.find(
          (item) => item.controls.filename.value === testData.fileName,
        );
        control?.patchValue(
          {
            ...control.value,
            filename: uploadedFileName,
            description: testData.fileDescription,
          },
          { emitEvent: false },
        );
        this.explorerUploadItemsService.uploadItems$.next(formArray);
        return combineLatest([
          // TODO вынести в отдельный метод в QtisTestsService.
          //  Должен загружать файл и проверять что он есть в директории с правильным описанием и уровнем доступа
          //  И возвращать только testResults
          of(testResults),
          this.explorerUploadService.uploadHexString(fileUploadPath).pipe(
            takeUntil(this.teardownUploadSubject),
            catchError((err: HttpErrorResponse) =>
              throwError(() => [
                ...testResults,
                {
                  title: 'Upload file',
                  description: `Upload file to ${testData.folderForTests}/${folderName}/${nestedFolderName}`,
                  responseStatus: `${err.status} ${err.statusText}`,
                  response: err.error ?? '',
                  errorText: 'Cant execute next tests without uploaded file',
                  result: TestResult.FAIL,
                },
              ]),
            ),
          ),
        ]);
      }),
      concatMap(([testResults]) => {
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
                    errorText: 'Cant execute next tests without uploaded file',
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
                      uploadedFile.description === testData.fileDescription
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
                    errorText: 'Cant execute next tests without copied file',
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
                          this.explorerService.getContents(`${folderPath}`),
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
      map((results) => ({
        isLoading: false,
        isError: false,
        results: flattenArray(results),
      })),
      startWith({
        isLoading: true,
        isError: false,
        results: undefined,
      }),
      finalize(() => {
        console.warn('FS TESTS FINALIZED');
      }),
      shareReplay(1),
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
