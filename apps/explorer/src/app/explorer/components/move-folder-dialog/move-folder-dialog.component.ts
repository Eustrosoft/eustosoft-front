import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExplorerService } from '../../services/explorer.service';
import {
  BehaviorSubject,
  map,
  merge,
  Observable,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import {
  FileSystemObject,
  FileSystemObjectTypes,
} from '@eustrosoft-front/core';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { CreateRenameDialogData } from '../../interfaces/create-rename-dialog-data.interface';
@Component({
  selector: 'eustrosoft-front-move-folder-dialog',
  templateUrl: './move-folder-dialog.component.html',
  styleUrls: ['./move-folder-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveFolderDialogComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  currentPath: string[] = [];

  fsObjects$!: Observable<FileSystemObject[]>;
  moveButtonDisabled$!: Observable<boolean>;
  newPath$ = new BehaviorSubject<string>('/');
  private matSelectionListRendered$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  fsObjTypes = FileSystemObjectTypes;
  cancelButtonText = $localize`Cancel`;
  moveButtonText = $localize`Move`;
  createNewFolderTitleText = $localize`Create new folder`;

  @ViewChild(MatSelectionList) matSelectionList!: MatSelectionList;

  private data: { fsObj: FileSystemObject } = inject(MAT_DIALOG_DATA);
  private dialogRef: MatDialogRef<MoveFolderDialogComponent> = inject(
    MatDialogRef<MoveFolderDialogComponent>
  );
  private explorerService: ExplorerService = inject(ExplorerService);
  private cd: ChangeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.fsObjects$ = this.newPath$
      .asObservable()
      .pipe(
        switchMap((path: string) => this.explorerService.getFsObjects(path))
      );

    this.moveButtonDisabled$ = this.matSelectionListRendered$.pipe(
      switchMap(() =>
        merge(
          this.matSelectionList.options.changes,
          this.matSelectionList.selectedOptions.changed
        )
      ),
      map(() => {
        const hasDirectories =
          this.matSelectionList.options
            .toArray()
            .map((item: MatListOption) => item.value)
            .filter(
              (value: FileSystemObject) =>
                value.type === FileSystemObjectTypes.DIRECTORY
            ).length > 0;

        /**
         * TODO
         *  Если переносится файл - отключать кнопку если в этой папке уже есть этот файл
         *  Если переносится папка - подсвечивать серым эту папку не давая перенести ее в саму себя
         *  Должна быть возможность выбирать и снимать выбор с папки куда хотим перенести файл
         *  Если выбрана какая-то папка - кнопка должна быть активна и взять путь выбранной папки
         *  Если не выбрана не одна папка или мы находимся в конце иерархии - кнопка должна быть активна и взять текущий путь
         */

        if (
          hasDirectories &&
          !this.matSelectionList.selectedOptions.hasValue()
        ) {
          return true;
        }
        if (
          hasDirectories &&
          this.matSelectionList.selectedOptions.hasValue()
        ) {
          return false;
        }
        if (!hasDirectories) {
          return false;
        }
        return true;
      }),
      tap(() => {
        setTimeout(() => {
          this.cd.detectChanges();
        }, 0);
      })
    );
  }

  ngAfterViewInit(): void {
    this.matSelectionListRendered$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  createNewFolder(): void {
    return;
  }

  reject(): void {
    this.dialogRef.close();
  }

  resolve(): void {
    if (this.matSelectionList.selectedOptions.hasValue()) {
      this.dialogRef.close(
        `${this.matSelectionList.selectedOptions.selected[0].value.fullPath}/${this.data.fsObj.fileName}`
      );
    } else {
      this.dialogRef.close(
        `${this.currentPath.pop()}/${this.data.fsObj.fileName}`
      );
    }
  }
}
