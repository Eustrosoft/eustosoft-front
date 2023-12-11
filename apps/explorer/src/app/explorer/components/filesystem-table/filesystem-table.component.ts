/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { FileSystemObjectTypes } from '@eustrosoft-front/core';
import { Subject } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { FileSystemObject } from '../../models/file-system-object.interface';
import { FilesystemTableService } from '../../services/filesystem-table.service';

@Component({
  selector: 'eustrosoft-front-filesystem-table',
  templateUrl: './filesystem-table.component.html',
  styleUrls: ['./filesystem-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesystemTableComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() content!: FileSystemObject[];
  @Output() openClicked = new EventEmitter<FileSystemObject>();
  @Output() downloadClicked = new EventEmitter<FileSystemObject[]>();
  @Output() shareClicked = new EventEmitter<FileSystemObject[]>();
  @Output() renameClicked = new EventEmitter<FileSystemObject>();
  @Output() moveClicked = new EventEmitter<FileSystemObject[]>();
  @Output() copyClicked = new EventEmitter<FileSystemObject[]>();
  @Output() deleteClicked = new EventEmitter<FileSystemObject[]>();
  @Output() selectionChanged = new EventEmitter<FileSystemObject[]>();
  @Output() filesDroppedOnFolder = new EventEmitter<{
    files: File[];
    fsObj: FileSystemObject;
  }>();

  @ViewChild(MatSort) sort!: MatSort;

  protected readonly fsObjTypes = FileSystemObjectTypes;

  displayedColumns: string[] = [
    'select',
    'fileName',
    'space',
    'description',
    'securityLevel',
    'actions',
  ];

  protected readonly filesystemTableService = inject(FilesystemTableService);
  private readonly destroy$ = new Subject<void>();

  ngAfterViewInit(): void {
    this.filesystemTableService.dataSource.sort = this.sort;
  }

  ngOnChanges(): void {
    this.filesystemTableService.dataSource.data = this.content;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isAllSelected(): boolean {
    const numSelected = this.filesystemTableService.selection.selected.length;
    const numRows = this.filesystemTableService.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.filesystemTableService.selection.clear();
      return;
    }

    this.filesystemTableService.selection.select(
      ...this.filesystemTableService.dataSource.data
    );
  }

  selectRange(event: Event, row: FileSystemObject) {
    if (
      event instanceof KeyboardEvent &&
      event.shiftKey &&
      this.filesystemTableService.selection.selected.length > 0
    ) {
      const lastIndex =
        this.filesystemTableService.dataSource.data.indexOf(row);
      const firstIndex = this.filesystemTableService.dataSource.data.indexOf(
        this.filesystemTableService.selection.selected[0]
      );
      const start = Math.min(firstIndex, lastIndex);
      const end = Math.max(firstIndex, lastIndex);
      for (let i = start + 1; i < end; i++) {
        this.filesystemTableService.selection.select(
          this.filesystemTableService.dataSource.data[i]
        );
      }
    }
  }
}
