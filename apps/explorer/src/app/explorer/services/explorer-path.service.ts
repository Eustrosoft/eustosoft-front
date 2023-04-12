import { Injectable } from '@angular/core';

@Injectable()
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
