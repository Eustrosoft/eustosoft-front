/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { AuthenticationService } from '@eustrosoft-front/security';

@Injectable({ providedIn: 'root' })
export class ExplorerPathService {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly lastPathStorageKey = `qtis-explorer-last-path-${
    this.authenticationService.userInfo$.getValue().userId
  }`;

  getLastPathState(): string {
    return localStorage.getItem(this.lastPathStorageKey) ?? '/';
  }

  setLastPathState(path: string): void {
    localStorage.setItem(this.lastPathStorageKey, path);
  }

  getFullPathToLastFolder(path: string): string {
    path = path.replace(/\/$/, '');
    const pathArr = path.split('/');
    pathArr.pop();
    return pathArr.join('/');
  }

  checkExtension(filename: string, expectedExtension: string): boolean {
    const fileExtension = filename.split('.').pop()?.toLowerCase();
    return fileExtension === expectedExtension.toLowerCase();
  }
}
