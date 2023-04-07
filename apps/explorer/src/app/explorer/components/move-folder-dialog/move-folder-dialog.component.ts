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
  CmsResponseInterface,
  FileSystemObject,
  FileSystemObjectTypes,
  ViewRequest,
  ViewResponse,
} from '@eustrosoft-front/core';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { Stack } from '../../classes/Stack';
import { ExplorerRequestBuilderService } from '../../services/explorer-request-builder.service';
import { MoveDialogDataInterface } from './move-dialog-data.interface';

@Component({
  selector: 'eustrosoft-front-move-folder-dialog',
  templateUrl: './move-folder-dialog.component.html',
  styleUrls: ['./move-folder-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveFolderDialogComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  currentSelectedOptionIndex: number | undefined = undefined;

  fsObjects$!: Observable<FileSystemObject[]>;
  moveButtonDisabled$!: Observable<boolean>;
  path$ = new BehaviorSubject<string>('/');
  private matSelectionListRendered$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  fsObjTypes = FileSystemObjectTypes;
  cancelButtonText = $localize`Cancel`;
  moveButtonText = $localize`Move`;
  createNewFolderTitleText = $localize`Create new folder`;
  moveButtonErrorText = '';

  @ViewChild(MatSelectionList) matSelectionList!: MatSelectionList;

  private data: MoveDialogDataInterface = inject(MAT_DIALOG_DATA);
  private dialogRef: MatDialogRef<MoveFolderDialogComponent> = inject(
    MatDialogRef<MoveFolderDialogComponent>
  );
  private explorerService: ExplorerService = inject(ExplorerService);
  private explorerRequestBuilderService: ExplorerRequestBuilderService = inject(
    ExplorerRequestBuilderService
  );
  private cd: ChangeDetectorRef = inject(ChangeDetectorRef);
  private navigationHistoryStack: Stack<string> = inject(Stack);

  ngOnInit(): void {
    this.fsObjects$ = this.path$.asObservable().pipe(
      switchMap((path: string) =>
        this.explorerRequestBuilderService.buildViewRequest(path)
      ),
      switchMap((body) =>
        this.explorerService.dispatch<ViewRequest, ViewResponse>(body)
      ),
      map((response: CmsResponseInterface<ViewResponse>) =>
        response.r.flatMap((r: ViewResponse) => r.content)
      )
    );

    this.moveButtonDisabled$ = this.matSelectionListRendered$.pipe(
      switchMap(() =>
        merge(
          this.matSelectionList.options.changes,
          this.matSelectionList.selectedOptions.changed
        )
      ),
      map(() => {
        const fileAlreadyExistsInFolder =
          this.matSelectionList.options
            .toArray()
            .map((item: MatListOption) => item.value)
            .filter(
              (value: FileSystemObject) =>
                value.type === FileSystemObjectTypes.FILE &&
                this.data.fsObjects.filter(
                  (fsObj) => fsObj.fileName === value.fileName
                ).length > 0
            ).length > 0;

        const sameFolderIndexes = this.matSelectionList.options
          .toArray()
          .map((item: MatListOption) => item.value)
          .filter(
            (value: FileSystemObject) =>
              this.data.fsObjects.filter(
                (fsObj) => fsObj.fileName === value.fileName
              ).length > 0
          )
          .map((el, i) => i);

        sameFolderIndexes.forEach((index: number) => {
          const item = this.matSelectionList.options.get(index);
          if (item) {
            item.disabled = true;
          }
        });

        // const sameFolderIndex = this.matSelectionList.options
        //   .toArray()
        //   .map((item: MatListOption) => item.value)
        //   .findIndex(
        //     (value: FileSystemObject) =>
        //       value.type === FileSystemObjectTypes.DIRECTORY &&
        //       this.data.fsObjects.filter(
        //         (fsObj) => fsObj.fileName === value.fileName
        //       ).length > 0
        //   );
        //
        // if (sameFolderIndex !== -1) {
        //   const item = this.matSelectionList.options.get(sameFolderIndex);
        //   if (item) {
        //     item.disabled = true;
        //   }
        // }

        if (
          fileAlreadyExistsInFolder &&
          !this.matSelectionList.selectedOptions.hasValue()
        ) {
          this.moveButtonErrorText = $localize`File already exist in this folder`;
          return true;
        }

        if (
          sameFolderIndexes.length > 0 &&
          !this.matSelectionList.selectedOptions.hasValue()
        ) {
          this.moveButtonErrorText = $localize`This directory already contains folder with same name`;
          return true;
        }

        this.moveButtonErrorText = '';
        return false;
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
    this.navigationHistoryStack.push(object.fullPath);
    this.path$.next(object.fullPath);
  }

  navigateBack(): void {
    this.matSelectionList.deselectAll();
    this.path$.next(this.navigationHistoryStack.pop(true) || '/');
  }

  createNewFolder(): void {
    /** TODO
     *   Implement
     */
    return;
  }

  reject(): void {
    this.dialogRef.close();
  }

  resolve(): void {
    if (this.matSelectionList.selectedOptions.hasValue()) {
      const paths = this.data.fsObjects.map(
        (fsObj) =>
          `${this.matSelectionList.selectedOptions.selected[0].value.fullPath}/${fsObj.fileName}`
      );
      this.dialogRef.close(paths);
    } else {
      const paths = this.data.fsObjects.map(
        (fsObj) => `${this.path$.value}/${fsObj.fileName}`
      );
      this.dialogRef.close(paths);
    }
  }

  optionClicked(index: number): void {
    const option = this.matSelectionList.options.get(index);
    if (!option || option.disabled) {
      return;
    }
    // if we don't have selected option yet, set it
    if (this.currentSelectedOptionIndex === undefined) {
      this.currentSelectedOptionIndex = index;
      return;
    }
    // if different option is clicked
    if (this.currentSelectedOptionIndex !== index) {
      this.currentSelectedOptionIndex = index;
    } else {
      // if click performed on currently selected option
      option.toggle();
      this.currentSelectedOptionIndex = undefined;
    }
  }
}
