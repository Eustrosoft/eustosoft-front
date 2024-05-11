/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FileSystemObject } from '../interfaces/file-system-object.interface';
import { SelectionModel } from '@angular/cdk/collections';

@Injectable({ providedIn: 'root' })
export class FilesystemTableService {
  dataSource = new MatTableDataSource<FileSystemObject>([]);
  selection = new SelectionModel<FileSystemObject>(true, []);

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  selectRange(event: Event, row: FileSystemObject): void {
    if (
      event instanceof KeyboardEvent &&
      event.shiftKey &&
      this.selection.selected.length > 0
    ) {
      const lastIndex = this.dataSource.data.indexOf(row);
      const firstIndex = this.dataSource.data.indexOf(
        this.selection.selected[0],
      );
      const start = Math.min(firstIndex, lastIndex);
      const end = Math.max(firstIndex, lastIndex);
      for (let i = start + 1; i < end; i++) {
        this.selection.select(this.dataSource.data[i]);
      }
    }
  }
}
