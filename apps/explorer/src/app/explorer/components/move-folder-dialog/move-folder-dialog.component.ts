import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ExplorerService } from '../../services/explorer.service';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import {
  FileSystemObject,
  FileSystemObjectTypes,
} from '@eustrosoft-front/core';

@Component({
  selector: 'eustrosoft-front-move-folder-dialog',
  templateUrl: './move-folder-dialog.component.html',
  styleUrls: ['./move-folder-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveFolderDialogComponent implements OnInit {
  fsObjects$!: Observable<FileSystemObject[]>;
  newPath$ = new BehaviorSubject<string>('');
  fsObjTypes = FileSystemObjectTypes;

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

  close(): void {
    this.dialogRef.close();
  }

  navigateForward($event: MouseEvent, object: FileSystemObject): void {
    $event.stopPropagation();
    this.newPath$.next(object.fullPath);
  }

  navigateBack(): void {}
}
