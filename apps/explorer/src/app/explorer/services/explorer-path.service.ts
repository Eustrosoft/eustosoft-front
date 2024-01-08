/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExplorerPathService {
  updateLastPathState(path: string): void {
    localStorage.setItem('qtis-explorer-last-path', path);
  }

  getFullPathToLastFolder(path: string): string {
    path = path.replace(/\/$/, '');
    const pathArr = path.split('/');
    pathArr.pop();
    return pathArr.join('/');
  }
}
