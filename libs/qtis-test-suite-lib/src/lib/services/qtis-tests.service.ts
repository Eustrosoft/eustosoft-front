import { inject, Injectable } from '@angular/core';
import { TestResult } from '../interfaces/test-case.interface';
import {
  ExplorerFsObjectTypes,
  ExplorerRequestActions,
  ExplorerService,
  ExplorerUploadItemFormFactoryService,
  ExplorerUploadItemsService,
  ExplorerUploadService,
  FileSystemObject,
} from '@eustrosoft-front/explorer-lib';
import { QtisRequestResponse } from '@eustrosoft-front/core';
import { LoginService, SecurityLevels } from '@eustrosoft-front/security';
import {
  catchError,
  combineLatest,
  concatMap,
  filter,
  map,
  Observable,
  of,
  Subject,
  takeUntil,
  throwError,
} from 'rxjs';
import { LoginLogoutResponse } from '@eustrosoft-front/login-lib';
import { TestCaseResult } from '../interfaces/test-case-result.interface';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Chat,
  CreateChatDialogReturnData,
  MsgChatStatus,
  MsgService,
} from '@eustrosoft-front/msg-lib';

@Injectable({
  providedIn: 'root',
})
export class QtisTestsService {
  private readonly explorerService = inject(ExplorerService);
  private readonly msgService = inject(MsgService);
  private readonly explorerUploadService = inject(ExplorerUploadService);
  private readonly explorerUploadItemsService = inject(
    ExplorerUploadItemsService,
  );
  private readonly explorerUploadItemFormFactoryService = inject(
    ExplorerUploadItemFormFactoryService,
  );
  private readonly loginService = inject(LoginService);

  login$(login: string, password: string): Observable<TestCaseResult[]> {
    return this.loginService.login(login, password).pipe(
      map<QtisRequestResponse<LoginLogoutResponse>, TestCaseResult[]>(
        (response) => [
          {
            title: 'Login',
            description: 'Login with Test User Login and Test User Password',
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
    );
  }

  createDir$(
    path: string,
    folderName: string,
    description: string,
    securityLevel: string,
  ): Observable<[TestCaseResult[], FileSystemObject]> {
    return this.explorerService
      .create(
        path,
        folderName,
        ExplorerFsObjectTypes.DIRECTORY,
        description,
        securityLevel,
      )
      .pipe(
        concatMap(() =>
          this.explorerService.getContents(path).pipe(
            concatMap((response) => {
              const createdFolder = response?.content?.find(
                (item) => item.fileName === folderName,
              );
              let result: TestCaseResult[] = [];
              if (createdFolder === undefined) {
                return throwError(() => [
                  {
                    title: `Create folder in ${path}`,
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
                  title: `Create folder in ${path}`,
                  description: 'Check if directory was created',
                  response: response.content,
                  result: TestResult.OK,
                },
              ];
              result = [
                ...result,
                {
                  title: 'Check description',
                  description: `Check if description of ${path}/${folderName} equals "${description}"`,
                  response: response.content,
                  result:
                    createdFolder.description === description
                      ? TestResult.OK
                      : TestResult.FAIL,
                },
              ];
              result = [
                ...result,
                {
                  title: 'Check security level',
                  description: `Check if securityLevel of ${path}/${folderName} equals ${securityLevel}`,
                  response: response.content,
                  result:
                    Number(createdFolder.securityLevel.value) === +securityLevel
                      ? TestResult.OK
                      : TestResult.FAIL,
                },
              ];
              return combineLatest([of(result), of(createdFolder)]);
            }),
          ),
        ),
        catchError((err: HttpErrorResponse) => {
          return throwError(() => [
            {
              title: `Create folder ${folderName}`,
              description: 'Check if directory was created',
              responseStatus: `${err.status} ${err.statusText}`,
              response: err.error ?? '',
              errorText: 'Cant execute next tests without created directory',
              result: TestResult.FAIL,
            },
          ]);
        }),
      );
  }

  uploadFile$(
    files: File[],
    fileUploadPath: string,
    fileName: string,
    securityLevel: string,
    description: string,
    uploadedFileName: string,
  ): Observable<[TestCaseResult[], FileSystemObject[] | undefined]> {
    const teardownUploadSubject = new Subject<void>();
    const formArray =
      this.explorerUploadItemFormFactoryService.makeUploadItemsForm(
        files,
        fileUploadPath,
        <SecurityLevels>securityLevel,
        description,
      );
    const control = formArray.controls.find(
      (item) => item.controls.filename.value === fileName,
    );
    control?.patchValue(
      {
        ...control.value,
        filename: uploadedFileName,
        description: description,
      },
      { emitEvent: false },
    );
    this.explorerUploadItemsService.uploadItems$.next(formArray);

    return of(fileUploadPath).pipe(
      concatMap((path) =>
        this.explorerUploadService.uploadHexString(path).pipe(
          takeUntil(teardownUploadSubject),
          catchError((err: HttpErrorResponse) =>
            throwError(() => [
              {
                title: 'Upload file',
                description: `Upload file to ${fileUploadPath}`,
                responseStatus: `${err.status} ${err.statusText}`,
                response: err.error ?? '',
                errorText: 'Cant execute next tests without uploaded file',
                result: TestResult.FAIL,
              },
            ]),
          ),
        ),
      ),
      concatMap(() => {
        teardownUploadSubject.next();
        return this.explorerService.getContents(fileUploadPath);
      }),
      concatMap((response) => {
        const uploadedFile = response?.content?.find(
          (item) => item.fileName === uploadedFileName,
        );
        if (uploadedFile === undefined) {
          return throwError(() => [
            {
              title: 'Upload file',
              description: `Check if file was uploaded to ${fileUploadPath}`,
              response: response,
              errorText: 'Cant execute next tests without uploaded file',
              result: TestResult.FAIL,
            },
          ]);
        }
        return combineLatest([
          of([
            {
              title: 'Upload file',
              description: `Check if file was uploaded to ${fileUploadPath}`,
              response: response.content,
              result: TestResult.OK,
            },
            {
              title: 'Check file description',
              description: `Check if description of ${uploadedFile.fileName} equals "${description}"`,
              response: response.content,
              result:
                uploadedFile.description === description
                  ? TestResult.OK
                  : TestResult.FAIL,
            },
            {
              title: 'Check security level',
              description: `Check if securityLevel of ${uploadedFile.fileName} equals ${securityLevel}`,
              response: response.content,
              result:
                uploadedFile.securityLevel.value === securityLevel
                  ? TestResult.OK
                  : TestResult.FAIL,
            },
          ]),
          of(response.content),
        ]);
      }),
    );
  }

  copyMoveFsObject$(
    from: FileSystemObject[],
    to: string[],
    explorerRequestActions:
      | ExplorerRequestActions.COPY
      | ExplorerRequestActions.MOVE,
    folderToCheckPath: string,
    name: string,
  ): Observable<[TestCaseResult[], FileSystemObject]> {
    const fsObjName = this.getFsObjectTypeName(from);
    const uFsActionName = this.getFsActionName(explorerRequestActions, true);
    const fsActionName = this.getFsActionName(explorerRequestActions);
    return of(true).pipe(
      concatMap(() =>
        this.explorerService.move(from, to, explorerRequestActions).pipe(
          catchError((err: HttpErrorResponse) =>
            throwError(() => [
              {
                title: `${uFsActionName.action} ${fsObjName}`,
                description: `${uFsActionName.action}  ${fsObjName} to ${to[0]}`,
                responseStatus: `${err.status} ${err.statusText}`,
                response: err.error ?? '',
                errorText: `Cant execute next tests without ${fsActionName.doneAction} ${fsObjName}`,
                result: TestResult.FAIL,
              },
            ]),
          ),
        ),
      ),
      concatMap(() => this.explorerService.getContents(folderToCheckPath)),
      concatMap((response) => {
        const file = response?.content?.find((item) => item.fileName === name);
        if (file === undefined) {
          return throwError(() => [
            {
              title: `${uFsActionName.action} ${fsObjName}`,
              description: `Check if ${fsObjName} was ${fsActionName.doneAction} to ${folderToCheckPath}/${name}`,
              response: response,
              errorText: `Cant execute next tests without ${fsActionName.doneAction} ${fsObjName}`,
              result: TestResult.FAIL,
            },
          ]);
        }
        return combineLatest([
          of([
            {
              title: `Check ${fsActionName.doneAction} ${fsObjName}`,
              description: `Check if ${fsObjName} ${name} was ${fsActionName.doneAction} to ${folderToCheckPath}/${name}`,
              response: response.content,
              result: TestResult.OK,
            },
          ]),
          of(file),
        ]);
      }),
    );
  }

  renameFsObject$(
    from: FileSystemObject,
    name: string,
    description: string,
    folderToCheckPath: string,
  ): Observable<[TestCaseResult[], FileSystemObject]> {
    const fsObjName = this.getFsObjectTypeName(from);
    return of(true).pipe(
      concatMap(() =>
        this.explorerService.rename(from, { name, description }).pipe(
          catchError((err: HttpErrorResponse) =>
            throwError(() => [
              {
                title: `Rename ${fsObjName}`,
                description: `Rename ${fsObjName} to "Renamed-Copy-${name}"`,
                responseStatus: `${err.status} ${err.statusText}`,
                response: err.error ?? '',
                errorText: `Cant execute next tests without renamed ${fsObjName}`,
                result: TestResult.FAIL,
              },
            ]),
          ),
        ),
      ),
      concatMap(() => this.explorerService.getContents(folderToCheckPath)),
      concatMap((response) => {
        const renamedFile = response?.content?.find(
          (item) => item.fileName === `${name}`,
        );
        if (renamedFile === undefined) {
          return throwError(() => [
            {
              title: `Rename ${fsObjName}`,
              description: `Check if ${fsObjName} was renamed to "${name}"`,
              response: response,
              errorText: `Cant execute next tests without renamed ${fsObjName}`,
              result: TestResult.FAIL,
            },
          ]);
        }
        return combineLatest([
          of([
            {
              title: `Rename ${fsObjName}`,
              description: `Check if ${fsObjName} ${name} was renamed to "${name}"`,
              response: response.content,
              result: TestResult.OK,
            },
          ]),
          of(renamedFile),
        ]);
      }),
    );
  }

  deleteFsObject$(
    fsObjects: FileSystemObject[],
    folderPath: string,
  ): Observable<TestCaseResult[]> {
    const objWord = fsObjects.length > 1 ? 'objects' : 'object';
    const fsObjName = this.getFsObjectTypeName(fsObjects, fsObjects.length > 1);
    return of(true).pipe(
      concatMap(() =>
        this.explorerService.delete(fsObjects).pipe(
          catchError((err: HttpErrorResponse) =>
            throwError(() => [
              {
                title: `Delete ${fsObjName}`,
                description: `Delete ${fsObjects
                  .map((obj) => obj.fileName)
                  .join()}`,
                responseStatus: `${err.status} ${err.statusText}`,
                response: err.error ?? '',
                errorText: 'Delete failed',
                result: TestResult.FAIL,
              },
            ]),
          ),
        ),
      ),
      concatMap(() => this.explorerService.getContents(folderPath)),
      concatMap((response) => {
        const notDeleted = response?.content?.filter((cont) =>
          fsObjects.some((fsObj) => fsObj.fileName === cont.fileName),
        );
        if (!!notDeleted && notDeleted.length > 0) {
          return throwError(() => [
            {
              title: `Delete ${fsObjName}`,
              description: `Check if ${objWord} deleted`,
              response: response,
              errorText: `Not deleted: ${notDeleted!
                .map((obj) => obj.fileName)
                .join()}`,
              result: TestResult.FAIL,
            },
          ]);
        }
        return of([
          {
            title: `Delete ${fsObjName}`,
            description: `Check if ${objWord} were deleted successfully`,
            response: response.content,
            result: TestResult.OK,
          },
        ]);
      }),
    );
  }

  createChat$(
    testResults: TestCaseResult[],
    data: CreateChatDialogReturnData,
  ): Observable<[TestCaseResult[], TestCaseResult[], TestCaseResult[], Chat]> {
    return of(true).pipe(
      concatMap(() =>
        this.msgService.createNewChat$(data).pipe(
          catchError((err) =>
            throwError(() => [
              ...testResults,
              {
                title: `Create chat ${data.subject}`,
                description: '',
                responseStatus: `${err.status} ${err.statusText}`,
                response: err.error ?? '',
                errorText: 'Create chat failed',
                result: TestResult.FAIL,
              },
            ]),
          ),
        ),
      ),
      concatMap(() =>
        this.msgService.getChats$([]).pipe(
          filter((chats) => !chats.isLoading),
          concatMap((chats) => {
            const chat = chats?.chats?.find(
              (chat) => chat.subject === data.subject,
            );
            if (chat === undefined) {
              return throwError(() => [
                ...testResults,
                {
                  title: 'Check if chat was created',
                  description: '',
                  response: chats.chats,
                  errorText: `Cant find chat with subject ${data.subject} in chat list`,
                  result: TestResult.FAIL,
                },
              ]);
            }
            if (chat.zsid === null) {
              chat.zsid = undefined;
            }
            return combineLatest([
              of(testResults),
              of([
                {
                  title: `Check if chat ${data.subject} was created`,
                  description: '',
                  response: chats.chats,
                  result: TestResult.OK,
                },
                {
                  title: `Check if chat ${data.subject} was created with provided security level`,
                  description: `{ zlvl } must be equal ${+data.securityLevel!}`,
                  response: chats.chats,
                  result:
                    chat.zlvl === +data.securityLevel!
                      ? TestResult.OK
                      : TestResult.FAIL,
                },
                {
                  title: `Check if chat ${data.subject} was created with provided scope`,
                  description: `{ zsid } must be equal ${data.scope!}`,
                  response: chats.chats,
                  result:
                    chat.zsid === data.scope ? TestResult.OK : TestResult.FAIL,
                },
              ]),
              this.checkIfChatVersionWasUpdated$(
                chat.zoid,
                chat.zver,
                testResults,
              ),
              of(chat),
            ]);
          }),
        ),
      ),
    );
  }

  checkIfChatVersionWasUpdated$(
    zoid: number,
    zver: number,
    testResults: TestCaseResult[],
    statuses: MsgChatStatus[] = [],
  ): Observable<TestCaseResult[]> {
    return this.msgService.getChatsUpdates$(statuses).pipe(
      concatMap((versions) => {
        const chat = versions.find((ver) => ver.zoid === zoid);
        if (chat === undefined) {
          return throwError(() => [
            ...testResults,
            {
              title: 'Check chat version',
              description: '',
              response: versions,
              errorText: `Cant find chat with zoid ${zoid} in versions list`,
              result: TestResult.FAIL,
            },
          ]);
        }
        return of([
          {
            title: 'Check chat version',
            description: `Check if chat with zoid ${zoid} has updated version`,
            response: versions,
            result: zver === chat.zver ? TestResult.OK : TestResult.FAIL,
          },
        ]);
      }),
    );
  }

  getFsObjectTypeName(
    obj: FileSystemObject | FileSystemObject[],
    plural = false,
  ): string {
    let isFile: boolean;
    let isDir: boolean;
    if (Array.isArray(obj)) {
      const isEveryObjIsFile = obj.every(
        (fr) => fr.type === ExplorerFsObjectTypes.FILE,
      );
      const isEveryObjIsDir = obj.every(
        (fr) => fr.type === ExplorerFsObjectTypes.DIRECTORY,
      );
      isFile = isEveryObjIsFile;
      isDir = isEveryObjIsDir;
    } else {
      isFile = obj.type === ExplorerFsObjectTypes.FILE;
      isDir = obj.type === ExplorerFsObjectTypes.DIRECTORY;
    }
    let name = '';
    if (isFile) {
      name = 'file';
    }
    if (isFile && plural) {
      name = 'files';
    }
    if (isDir) {
      name = 'directory';
    }
    if (isDir && plural) {
      name = 'directories';
    }
    if (!isFile && !isDir) {
      name = 'mixed files and dirs';
    }
    return name;
  }

  getFsActionName(
    action: ExplorerRequestActions,
    uppercaseFirstLetter: boolean = false,
  ): {
    action: string;
    doneAction: string;
  } {
    switch (action) {
      case ExplorerRequestActions.COPY:
        return {
          action: `${uppercaseFirstLetter ? 'C' : 'c'}opy`,
          doneAction: `${uppercaseFirstLetter ? 'C' : 'c'}opied`,
        };
      case ExplorerRequestActions.MOVE:
        return {
          action: `${uppercaseFirstLetter ? 'M' : 'm'}ove`,
          doneAction: `${uppercaseFirstLetter ? 'M' : 'm'}oved`,
        };
      default:
        return { action: 'UNKNOWN', doneAction: 'UNKNOWN' };
    }
  }

  getFormattedDate(): string {
    const currentDate = new Date();
    const isoDate = currentDate.toISOString().split('T')[0];
    const timeString = currentDate.toTimeString().split(' ')[0];
    return `${isoDate}T${timeString}.000Z`;
  }
}
