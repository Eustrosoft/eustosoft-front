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
  inject,
  input,
  OnChanges,
  output,
  viewChild,
} from '@angular/core';
import { BytesToSizePipe } from '@eustrosoft-front/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  ExplorerFileSystemTableCols,
  ExplorerFsObjectTypes,
  FileSystemObject,
  FilesystemTableService,
} from '@eustrosoft-front/explorer-lib';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { FilesDropZoneDirective } from '../../directives/files-drop-zone.directive';
import { debounceTime, Subject } from 'rxjs';
import { outputFromObservable } from '@angular/core/rxjs-interop';

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
  readonly content = input.required<FileSystemObject[]>();

  protected readonly openClicked$ = new Subject<FileSystemObject>();

  // TODO Lyasrt Определится с debounceTime
  readonly openClicked = outputFromObservable(
    this.openClicked$.asObservable().pipe(debounceTime(0)),
  );
  readonly downloadClicked = output<FileSystemObject[]>();
  readonly previewClicked = output<FileSystemObject>();
  readonly shareClicked = output<FileSystemObject[]>();
  readonly versionsClicked = output<FileSystemObject[]>();
  readonly renameClicked = output<FileSystemObject>();
  readonly moveClicked = output<FileSystemObject[]>();
  readonly copyClicked = output<FileSystemObject[]>();
  readonly deleteClicked = output<FileSystemObject[]>();
  readonly filesDroppedOnFolder = output<{
    files: File[];
    fsObj: FileSystemObject;
  }>();

  readonly sort = viewChild.required<MatSort>(MatSort);

  protected readonly filesystemTableService = inject(FilesystemTableService);
  protected readonly ExplorerFsObjectTypes = ExplorerFsObjectTypes;
  protected readonly displayedColumns: string[] = [
    ExplorerFileSystemTableCols.SELECT,
    ExplorerFileSystemTableCols.FILENAME,
    ExplorerFileSystemTableCols.SPACE,
    ExplorerFileSystemTableCols.DESCRIPTION,
    ExplorerFileSystemTableCols.SECURITY_LEVEL,
    ExplorerFileSystemTableCols.ACTIONS,
  ];

  ngAfterViewInit(): void {
    this.filesystemTableService.dataSource.sort = this.sort();
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
    this.filesystemTableService.dataSource.data = this.content();
  }
}
