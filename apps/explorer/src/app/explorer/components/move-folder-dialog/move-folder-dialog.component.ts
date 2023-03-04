import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ExplorerService } from '../../services/explorer.service';
import { BehaviorSubject, delay, map, Observable, switchMap } from 'rxjs';
import {
  FileSystemObject,
  FileSystemObjectTypes,
} from '@eustrosoft-front/core';
import { MatSelectionList } from '@angular/material/list';

@Component({
  selector: 'eustrosoft-front-move-folder-dialog',
  templateUrl: './move-folder-dialog.component.html',
  styleUrls: ['./move-folder-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveFolderDialogComponent implements OnInit {
  fsObjects$!: Observable<FileSystemObject[]>;
  newPath$ = new BehaviorSubject<string>('/');
  currentPath: string[] = ['/'];
  fsObjTypes = FileSystemObjectTypes;

  @ViewChild(MatSelectionList) matSelectionList!: MatSelectionList;

  private dialogRef: MatDialogRef<MoveFolderDialogComponent> = inject(
    MatDialogRef<MoveFolderDialogComponent>
  );
  private explorerService: ExplorerService = inject(ExplorerService);

  ngOnInit(): void {
    this.fsObjects$ = this.newPath$.asObservable().pipe(
      switchMap((path: string) => this.explorerService.getFsObjects(path)),
      map((objects: FileSystemObject[]) =>
        objects.filter(
          (o) =>
            o.type !== FileSystemObjectTypes.FILE &&
            o.type !== FileSystemObjectTypes.LINK
        )
      )
    );
  }

  navigateForward($event: MouseEvent, object: FileSystemObject): void {
    $event.stopPropagation();
    this.matSelectionList.deselectAll();
    this.currentPath.push(object.fullPath);
    this.newPath$.next(object.fullPath);
  }

  navigateBack(): void {
    this.matSelectionList.deselectAll();
    if (this.currentPath.length === 1) {
      return;
    }
    this.currentPath.splice(this.currentPath.length - 1, 1);
    this.newPath$.next(this.currentPath[this.currentPath.length - 1]);
  }

  reject(): void {
    this.dialogRef.close();
  }

  resolve(): void {
    this.dialogRef.close(
      this.matSelectionList.selectedOptions.hasValue() &&
        this.matSelectionList.selectedOptions.selected[0].value
    );
  }
}
