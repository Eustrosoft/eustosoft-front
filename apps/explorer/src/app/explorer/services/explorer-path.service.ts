import { Injectable } from '@angular/core';

@Injectable()
export class ExplorerPathService {
  getFullPathToLastFolder(path: string): string {
    path = path.replace(/\/$/, '');
    const pathArr = path.split('/');
    pathArr.pop();
    return pathArr.join('/');
  }
}
