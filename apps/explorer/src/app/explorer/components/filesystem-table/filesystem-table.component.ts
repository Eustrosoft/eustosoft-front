import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FileSystemObject,
  FileSystemObjectTypes,
} from '@eustrosoft-front/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { MatSort } from '@angular/material/sort';

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
  @Output() renameClicked = new EventEmitter<FileSystemObject>();
  @Output() moveClicked = new EventEmitter<FileSystemObject[]>();
  @Output() copyClicked = new EventEmitter<FileSystemObject[]>();
  @Output() deleteClicked = new EventEmitter<FileSystemObject[]>();
  @Output() filesDroppedOnFolder = new EventEmitter<{
    files: File[];
    fsObj: FileSystemObject;
  }>();

  @ViewChild(MatSort) sort!: MatSort;

  fsObjTypes = FileSystemObjectTypes;

  displayedColumns: string[] = [
    'select',
    'fileName',
    'space',
    'modified',
    'actions',
  ];
  dataSource = new MatTableDataSource<FileSystemObject>([]);
  selection = new SelectionModel<FileSystemObject>(true, []);

  private destroy$ = new Subject<void>();

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource.data = this.content;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  selectRange(event: Event, row: FileSystemObject) {
    if (
      event instanceof KeyboardEvent &&
      event.shiftKey &&
      this.selection.selected.length > 0
    ) {
      const lastIndex = this.dataSource.data.indexOf(row);
      const firstIndex = this.dataSource.data.indexOf(
        this.selection.selected[0]
      );
      const start = Math.min(firstIndex, lastIndex);
      const end = Math.max(firstIndex, lastIndex);
      for (let i = start + 1; i < end; i++) {
        this.selection.select(this.dataSource.data[i]);
      }
    }
  }
}
