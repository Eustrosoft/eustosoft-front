import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FileSystemObject,
  FileSystemObjectTypes,
} from '@eustrosoft-front/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';

@Component({
  selector: 'eustrosoft-front-filesystem-table',
  templateUrl: './filesystem-table.component.html',
  styleUrls: ['./filesystem-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesystemTableComponent implements OnChanges, OnDestroy {
  @Input() content!: FileSystemObject[];

  @Output() openClicked = new EventEmitter<FileSystemObject>();
  @Output() downloadClicked = new EventEmitter<FileSystemObject>();
  @Output() renameClicked = new EventEmitter<FileSystemObject>();
  @Output() moveClicked = new EventEmitter<FileSystemObject[]>();
  @Output() copyClicked = new EventEmitter<FileSystemObject[]>();
  @Output() deleteClicked = new EventEmitter<FileSystemObject[]>();
  @Output() filesDroppedOnFolder = new EventEmitter<{
    files: File[];
    fsObj: FileSystemObject;
  }>();

  fsObjTypes = FileSystemObjectTypes;

  displayedColumns: string[] = ['select', 'name', 'lastModified', 'actions'];
  dataSource = new MatTableDataSource<FileSystemObject>([]);
  selection = new SelectionModel<FileSystemObject>(true, []);

  private destroy$ = new Subject<void>();

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
}
