/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
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
  Output,
  ViewChild,
} from '@angular/core';
import { BytesToSizePipe } from '@eustrosoft-front/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  ExplorerFsObjectTypes,
  FileSystemObject,
} from '@eustrosoft-front/explorer-lib';
import { FilesystemTableService } from '../../services/filesystem-table.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { FilesDropZoneDirective } from '../../directives/files-drop-zone.directive';

@Component({
  selector: 'eustrosoft-front-filesystem-table',
  templateUrl: './filesystem-table.component.html',
  styleUrls: ['./filesystem-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    NgSwitch,
    NgSwitchCase,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    FilesDropZoneDirective,
    NgIf,
    BytesToSizePipe,
    TranslateModule,
  ],
})
export class FilesystemTableComponent implements OnChanges, AfterViewInit {
  @Input() content!: FileSystemObject[];
  @Output() openClicked = new EventEmitter<FileSystemObject>();
  @Output() downloadClicked = new EventEmitter<FileSystemObject[]>();
  @Output() previewClicked = new EventEmitter<FileSystemObject>();
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

  protected readonly filesystemTableService = inject(FilesystemTableService);
  protected readonly fsObjTypes = ExplorerFsObjectTypes;
  protected readonly displayedColumns: string[] = [
    'select',
    'fileName',
    'space',
    'description',
    'securityLevel',
    'actions',
  ];

  ngAfterViewInit(): void {
    this.filesystemTableService.dataSource.sort = this.sort;
    this.filesystemTableService.dataSource.sortingDataAccessor = (
      item: FileSystemObject,
      property: string,
    ): string | number => {
      const fsObj = item as never;
      switch (property) {
        case 'securityLevel':
          return item.securityLevel.displayText;
        default:
          // other items have primitive values
          return fsObj[property];
      }
    };
  }

  ngOnChanges(): void {
    this.filesystemTableService.dataSource.data = this.content;
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
      ...this.filesystemTableService.dataSource.data,
    );
  }

  selectRange(event: Event, row: FileSystemObject): void {
    if (
      event instanceof KeyboardEvent &&
      event.shiftKey &&
      this.filesystemTableService.selection.selected.length > 0
    ) {
      const lastIndex =
        this.filesystemTableService.dataSource.data.indexOf(row);
      const firstIndex = this.filesystemTableService.dataSource.data.indexOf(
        this.filesystemTableService.selection.selected[0],
      );
      const start = Math.min(firstIndex, lastIndex);
      const end = Math.max(firstIndex, lastIndex);
      for (let i = start + 1; i < end; i++) {
        this.filesystemTableService.selection.select(
          this.filesystemTableService.dataSource.data[i],
        );
      }
    }
  }
}
