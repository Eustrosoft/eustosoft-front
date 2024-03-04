import { inject, Injectable } from '@angular/core';
import { TestResult } from '../interfaces/test-case.interface';
import {
  ExplorerFsObjectTypes,
  ExplorerRequestBuilderService,
  ExplorerService,
  ExplorerUploadItemFormFactoryService,
  ExplorerUploadItemsService,
  ExplorerUploadService,
} from '@eustrosoft-front/explorer-lib';
import { DispatchService, QtisRequestResponse } from '@eustrosoft-front/core';
import { LoginService } from '@eustrosoft-front/security';
import { catchError, concatMap, map, Observable, of, throwError } from 'rxjs';
import { LoginLogoutResponse } from '@eustrosoft-front/login-lib';
import { TestCaseResult } from '../interfaces/test-case-result.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { QtisTestFormService } from './qtis-test-form.service';

@Injectable({
  providedIn: 'root',
})
export class QtisTestsService {
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

  login(login: string, password: string): Observable<TestCaseResult[]> {
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

  createDir(
    path: string,
    folderName: string,
    description: string,
    securityLevel: string,
  ): Observable<TestCaseResult[]> {
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
              return of(result);
            }),
          ),
        ),
        catchError((err: HttpErrorResponse) =>
          throwError(() => [
            {
              title: `Create folder ${folderName}`,
              description: 'Check if directory was created',
              responseStatus: `${err.status} ${err.statusText}`,
              response: err.error ?? '',
              errorText: 'Cant execute next tests without created directory',
              result: TestResult.FAIL,
            },
          ]),
        ),
      );
  }
}
