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
  ChatMessage,
  CreateChatDialogReturnData,
  DeleteChatMessageRequest,
  EditChatMessageRequest,
  MsgChatStatus,
  MsgMapperService,
  MsgService,
  SendChatMessageRequest,
} from '@eustrosoft-front/msg-lib';

@Injectable({
  providedIn: 'root',
})
export class QtisTestsService {
  private readonly explorerService = inject(ExplorerService);
  private readonly msgService = inject(MsgService);
  private readonly msgMapperService = inject(MsgMapperService);
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
    defaultScope: number,
    defaultSlvl: number,
    data: CreateChatDialogReturnData,
  ): Observable<[TestCaseResult[], TestCaseResult[], Chat]> {
    return of(true).pipe(
      concatMap(() =>
        this.msgService.createNewChat$(data).pipe(
          catchError((err: HttpErrorResponse) =>
            throwError(() => [
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
          catchError((err: HttpErrorResponse) =>
            throwError(() => [
              {
                title: 'Get chats',
                description: '',
                responseStatus: `${err.status} ${err.statusText}`,
                response: err.error ?? '',
                errorText: 'Get chats failed',
                result: TestResult.FAIL,
              },
            ]),
          ),
          filter((chats) => !chats.isLoading),
          concatMap((chats) => {
            const chat = chats?.chats?.find(
              (chat) => chat.subject === data.subject,
            );
            if (chat === undefined) {
              return throwError(() => [
                {
                  title: 'Check if chat was created',
                  description: '',
                  response: chats.chats,
                  errorText: `Cant find chat with subject ${data.subject} in chat list`,
                  result: TestResult.FAIL,
                },
              ]);
            }

            const securityLevelTestResult = {
              title: `Check if chat ${data.subject} was created with provided security level`,
              description: `{ zlvl } must be equal ${+data.securityLevel!}`,
              response: chats.chats,
              result:
                chat.zlvl === +data.securityLevel!
                  ? TestResult.OK
                  : TestResult.FAIL,
            };

            if (data.securityLevel === undefined) {
              securityLevelTestResult.title = `Check if chat ${data.subject} was created with default security level`;
              securityLevelTestResult.description = `{ zlvl } must be equal default (${defaultSlvl})`;
              securityLevelTestResult.result =
                chat.zlvl === defaultSlvl ? TestResult.OK : TestResult.FAIL;
            }

            const scopeTestResult = {
              title: `Check if chat ${data.subject} was created with provided scope`,
              description: `{ zsid } must be equal ${data.scope!}`,
              response: chats.chats,
              result:
                chat.zsid === data.scope ? TestResult.OK : TestResult.FAIL,
            };

            if (data.scope === undefined) {
              scopeTestResult.title = `Check if chat ${data.subject} was created with default scope`;
              scopeTestResult.description = `{ zsid } must be equal default (${defaultScope})`;
              scopeTestResult.result =
                chat.zsid === defaultScope ? TestResult.OK : TestResult.FAIL;
            }

            return combineLatest([
              of([
                {
                  title: `Check if chat ${data.subject} was created`,
                  description: '',
                  response: chats.chats,
                  result: TestResult.OK,
                },
                securityLevelTestResult,
                scopeTestResult,
              ]),
              this.checkIfChatVersionWasUpdated$(chat.zoid, chat.zver),
              of(chat),
            ]);
          }),
        ),
      ),
    );
  }

  changeChatStatus$(
    chat: Chat,
    status: MsgChatStatus,
  ): Observable<[TestCaseResult[], TestCaseResult[], Chat]> {
    return this.msgService
      .changeChatStatus$({
        zoid: chat.zoid,
        zrid: chat.zrid,
        subject: chat.subject,
        reference: null,
        status: status,
      })
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(() => [
            {
              title: 'Change chat status',
              description: '',
              responseStatus: `${err.status} ${err.statusText}`,
              response: err.error ?? '',
              errorText: 'Change chat status failed',
              result: TestResult.FAIL,
            },
          ]),
        ),
        concatMap(() =>
          this.msgService
            .getChats$([])
            .pipe(filter((chats) => !chats.isLoading)),
        ),
        concatMap(({ chats }) => {
          const chatFromList = chats!.find(
            (chatL) => chatL.subject === chat.subject,
          );
          if (chatFromList === undefined) {
            return throwError(() => [
              {
                title: 'Check if chat status was changed',
                description: '',
                response: chats,
                errorText: `Cant find chat with subject ${chat.subject} in chat list`,
                result: TestResult.FAIL,
              },
            ]);
          }
          return combineLatest([
            of([
              {
                title: `Check if status of chat ${chat.subject} changed`,
                description: `{ status } must be equal ${status}`,
                response: chats,
                result:
                  chatFromList.status === status
                    ? TestResult.OK
                    : TestResult.FAIL,
              },
            ]),
            this.checkIfChatVersionWasUpdated$(
              chatFromList.zoid,
              chatFromList.zver,
            ),
            of(chatFromList),
          ]);
        }),
      );
  }

  sendChatMessage$(
    params: SendChatMessageRequest['params'],
    chatZver: number,
  ): Observable<[TestCaseResult[], TestCaseResult[], ChatMessage]> {
    return this.msgService.sendChatMessage$(params).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(() => [
          {
            title: 'Send chat message',
            description: '',
            responseStatus: `${err.status} ${err.statusText}`,
            response: err.error ?? '',
            errorText: 'Send chat message failed',
            result: TestResult.FAIL,
          },
        ]),
      ),
      concatMap(() =>
        this.msgMapperService
          .fetchChatMessagesWithPreloader(params.zoid)
          .pipe(filter((messages) => !messages.isLoading)),
      ),
      concatMap(({ messages }) => {
        const createdMessage = messages!.find(
          (message) => message.content === params.content,
        );
        if (createdMessage === undefined) {
          return throwError(() => [
            {
              title: 'Check if message was sent',
              description: '',
              response: messages,
              errorText: `Cant find message with content ${params.content} in messages list`,
              result: TestResult.FAIL,
            },
          ]);
        }
        return combineLatest([
          of([
            {
              title: 'Check if message was sent to chat',
              description: `Check if message ${params.content} was sent to chat with zoid ${params.zoid}`,
              response: messages,
              result:
                createdMessage.content === params.content
                  ? TestResult.OK
                  : TestResult.FAIL,
            },
          ]),
          this.checkIfChatVersionWasUpdated$(params.zoid, chatZver),
          of(createdMessage),
        ]);
      }),
    );
  }

  editChatMessage$(
    params: EditChatMessageRequest['params'],
    chatZver: number,
  ): Observable<[TestCaseResult[], TestCaseResult[], ChatMessage]> {
    return this.msgService.editChatMessage$(params).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(() => [
          {
            title: 'Edit chat message',
            description: '',
            responseStatus: `${err.status} ${err.statusText}`,
            response: err.error ?? '',
            errorText: 'Edit chat message failed',
            result: TestResult.FAIL,
          },
        ]),
      ),
      concatMap(() =>
        this.msgMapperService
          .fetchChatMessagesWithPreloader(params.zoid)
          .pipe(filter((messages) => !messages.isLoading)),
      ),
      concatMap(({ messages }) => {
        const editedMessage = messages!.find(
          (message) => message.content === params.content,
        );
        if (editedMessage === undefined) {
          return throwError(() => [
            {
              title: 'Check if message was edited',
              description: '',
              response: messages,
              errorText: `Cant find message with content ${params.content} in messages list`,
              result: TestResult.FAIL,
            },
          ]);
        }
        return combineLatest([
          of([
            {
              title: 'Check if message was edited',
              description: `Check if message ${params.content} was edited in chat with zoid ${params.zoid}`,
              response: messages,
              result:
                editedMessage.content === params.content
                  ? TestResult.OK
                  : TestResult.FAIL,
            },
          ]),
          this.checkIfChatVersionWasUpdated$(params.zoid, chatZver),
          of(editedMessage),
        ]);
      }),
    );
  }

  deleteChatMessage$(
    params: DeleteChatMessageRequest['params'],
    chatZver: number,
  ): Observable<[TestCaseResult[], TestCaseResult[]]> {
    return this.msgService.deleteChatMessage$(params).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(() => [
          {
            title: 'Delete chat message',
            description: '',
            responseStatus: `${err.status} ${err.statusText}`,
            response: err.error ?? '',
            errorText: 'Delete chat message failed',
            result: TestResult.FAIL,
          },
        ]),
      ),
      concatMap(() =>
        this.msgMapperService
          .fetchChatMessagesWithPreloader(params.zoid)
          .pipe(filter((messages) => !messages.isLoading)),
      ),
      concatMap(({ messages }) => {
        const isMessageDeleted =
          messages!.filter((message) => message.zrid === params.zrid).length ===
          0;
        return combineLatest([
          of([
            {
              title: 'Check if message was deleted',
              description: `Check if message ${params.zrid} was deleted in chat with zoid ${params.zoid}`,
              response: messages,
              result: isMessageDeleted ? TestResult.OK : TestResult.FAIL,
            },
          ]),
          this.checkIfChatVersionWasUpdated$(params.zoid, chatZver),
        ]);
      }),
    );
  }

  checkIfChatVersionWasUpdated$(
    zoid: number,
    zver: number,
    statuses: MsgChatStatus[] = [],
  ): Observable<TestCaseResult[]> {
    return this.msgService.getChatsUpdates$(statuses).pipe(
      concatMap((versions) => {
        const chat = versions.find((ver) => ver.zoid === zoid);
        if (chat === undefined) {
          return throwError(() => [
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
            title: `Check if chat with zoid ${zoid} has updated version`,
            description: `Chat ${zoid} version ${zver} === ${chat.zver}`,
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
