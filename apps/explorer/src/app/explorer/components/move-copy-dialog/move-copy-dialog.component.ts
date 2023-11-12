/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
  QtisRequestResponseInterface,
  ViewRequest,
  ViewResponse,
} from '@eustrosoft-front/core';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { Stack } from '../../classes/Stack';
import { ExplorerRequestBuilderService } from '../../services/explorer-request-builder.service';
import { MoveCopyDialogDataInterface } from './move-copy-dialog-data.interface';
import { DispatchService } from '@eustrosoft-front/security';

@Component({
  selector: 'eustrosoft-front-move-folder-dialog',
  templateUrl: './move-copy-dialog.component.html',
  styleUrls: ['./move-copy-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveCopyDialogComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  currentSelectedOptionIndex: number | undefined = undefined;

  fsObjects$!: Observable<FileSystemObject[]>;
  moveButtonDisabled$!: Observable<boolean>;
  path$ = new BehaviorSubject<string>('/');
  private matSelectionListRendered$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  fsObjTypes = FileSystemObjectTypes;
  createNewFolderTitleText = `Create new folder`;
  moveButtonErrorText = '';

  @ViewChild(MatSelectionList) matSelectionList!: MatSelectionList;

  public data: MoveCopyDialogDataInterface = inject(MAT_DIALOG_DATA);
  private dialogRef: MatDialogRef<MoveCopyDialogComponent> = inject(
    MatDialogRef<MoveCopyDialogComponent>
  );
  private dispatchService: DispatchService = inject(DispatchService);
  private explorerRequestBuilderService: ExplorerRequestBuilderService = inject(
    ExplorerRequestBuilderService
  );
  private cd: ChangeDetectorRef = inject(ChangeDetectorRef);
  private navigationHistoryStack: Stack<string> = inject(Stack);

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown(e: KeyboardEvent) {
    e.stopPropagation();
    this.resolve();
  }

  ngOnInit(): void {
    this.fsObjects$ = this.path$.asObservable().pipe(
      switchMap((path: string) =>
        this.explorerRequestBuilderService.buildViewRequest(path)
      ),
      switchMap((body) =>
        this.dispatchService.dispatch<ViewRequest, ViewResponse>(body)
      ),
      map((response: QtisRequestResponseInterface<ViewResponse>) =>
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
        const options = this.matSelectionList.options
          .toArray()
          .map((item: MatListOption) => item.value) as FileSystemObject[];

        const matchingObjects = options.filter((option) =>
          this.data.fsObjects.some(
            (fsObject) => option.fileName === fsObject.fileName
          )
        );

        const matchingIndexes = matchingObjects.map((file) =>
          options.findIndex((f) => f.fileName === file.fileName)
        );

        const objectsAlreadyExistsInFolder =
          options.filter(
            (value: FileSystemObject) =>
              (value.type === FileSystemObjectTypes.FILE ||
                value.type === FileSystemObjectTypes.DIRECTORY) &&
              matchingIndexes.length > 0
          ).length > 0;

        matchingIndexes.forEach((index: number) => {
          const item = this.matSelectionList.options.get(index);
          if (item) {
            item.disabled = true;
          }
        });

        if (
          objectsAlreadyExistsInFolder &&
          !this.matSelectionList.selectedOptions.hasValue()
        ) {
          this.moveButtonErrorText = `Selected element already exist in this folder`;
          return true;
        }

        if (
          matchingIndexes.length > 0 &&
          !this.matSelectionList.selectedOptions.hasValue()
        ) {
          this.moveButtonErrorText = `This directory already contains folder with same name`;
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
      const paths = this.buildPaths(
        this.matSelectionList.selectedOptions.selected[0].value.fullPath,
        this.data.fsObjects
      );
      this.dialogRef.close(paths);
    } else {
      const paths = this.buildPaths(this.path$.value, this.data.fsObjects);
      this.dialogRef.close(paths);
    }
  }

  buildPaths(path: string, fsObjects: FileSystemObject[]): string[] {
    return fsObjects.map((fsObj) => {
      if (path === '/') {
        return `${path}${fsObj.fileName}`;
      }
      return `${path}/${fsObj.fileName}`;
    });
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
