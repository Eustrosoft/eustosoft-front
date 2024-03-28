/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { AuthenticationService } from '@eustrosoft-front/security';
import { HttpParams } from '@angular/common/http';
import {
  PRECONFIGURED_TRANSLATE_SERVICE,
  Subsystems,
} from '@eustrosoft-front/core';
import { ExplorerRequestActions } from '../constants/enums/explorer-actions.enum';
import { FileSystemObject } from '../interfaces/file-system-object.interface';
import { DOCUMENT } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable, take, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExplorerPathService {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly document = inject(DOCUMENT);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translateService = inject(PRECONFIGURED_TRANSLATE_SERVICE);
  private readonly lastPathStorageKey = 'qtis-explorer-last-path-';

  getLastPathState(): Observable<string> {
    return this.authenticationService.userInfo$.pipe(
      map((userInfo) => {
        return (
          localStorage.getItem(
            `${this.lastPathStorageKey}${userInfo.userId}`,
          ) ?? '/'
        );
      }),
    );
  }

  setLastPathState(path: string): void {
    this.authenticationService.userInfo$
      .pipe(
        tap((userInfo) => {
          localStorage.setItem(
            `${this.lastPathStorageKey}${userInfo.userId}`,
            path,
          );
        }),
        take(1),
      )
      .subscribe();
  }

  getFullPathToLastFolder(path: string): string {
    path = path.replace(/\/$/, '');
    const pathArr = path.split('/');
    pathArr.pop();
    return pathArr.join('/');
  }

  makeVersionLinks(rows: FileSystemObject[]): string[] {
    const itemsWithoutFileId = rows.filter((row) => row.fileId === undefined);
    const itemsWithFileId = rows.filter((row) => row.fileId !== undefined);
    if (itemsWithoutFileId.length === rows.length) {
      this.snackBar.open(
        this.translateService.instant('EXPLORER.ERRORS.VIRTUAL_OBJECT_ERROR'),
        'close',
      );
      return [];
    }

    return itemsWithFileId.map((row) => {
      const httpParams = new HttpParams({
        fromObject: {
          subsys: Subsystems.TIS,
          request: ExplorerRequestActions.VIEW,
          ZID: row.fileId!,
        },
      });
      return `${
        this.document.location.origin
      }/lk/qtis.jsp?${httpParams.toString()}`;
    });
  }
}
