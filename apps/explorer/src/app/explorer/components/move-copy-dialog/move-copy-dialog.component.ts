/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
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
import { FileSystemObjectTypes } from '@eustrosoft-front/core';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { Stack } from '../../classes/Stack';
import { MoveCopyDialogData } from './move-copy-dialog-data.interface';
import { FileSystemObject } from '../../models/file-system-object.interface';
import { ExplorerService } from '../../services/explorer.service';

@Component({
  selector: 'eustrosoft-front-move-folder-dialog',
  templateUrl: './move-copy-dialog.component.html',
  styleUrls: ['./move-copy-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveCopyDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatSelectionList) matSelectionList!: MatSelectionList;
  private readonly dialogRef: MatDialogRef<MoveCopyDialogComponent> = inject(
    MatDialogRef<MoveCopyDialogComponent>,
  );
  private readonly explorerService = inject(ExplorerService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly navigationHistoryStack: Stack<string> = inject(Stack);
  protected readonly data = inject<MoveCopyDialogData>(MAT_DIALOG_DATA);
  protected readonly fsObjTypes = FileSystemObjectTypes;

  private currentSelectedOptionIndex: number | undefined = undefined;
  private destroy$ = new Subject<void>();

  protected moveButtonDisabled$!: Observable<boolean>;
  protected moveButtonErrorText = '';
  protected path$ = new BehaviorSubject<string>(this.data.defaultPath ?? '/');
  protected fsObjects$ = this.path$
    .asObservable()
    .pipe(switchMap((path) => this.explorerService.getContents(path)));

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown(e: KeyboardEvent): void {
    e.stopPropagation();
    this.resolve();
  }

  ngAfterViewInit(): void {
    this.moveButtonDisabled$ = merge(
      this.matSelectionList.options.changes,
      this.matSelectionList.selectedOptions.changed,
    ).pipe(
      map(() => {
        const options = this.matSelectionList.options
          .toArray()
          .map((item: MatListOption) => item.value) as FileSystemObject[];

        const matchingObjects = options.filter((option) =>
          this.data.fsObjects.some(
            (fsObject) => option.fileName === fsObject.fileName,
          ),
        );

        const matchingIndexes = matchingObjects.map((file) =>
          options.findIndex((f) => f.fileName === file.fileName),
        );

        const objectsAlreadyExistsInFolder =
          options.filter(
            (value: FileSystemObject) =>
              (value.type === FileSystemObjectTypes.FILE ||
                value.type === FileSystemObjectTypes.DIRECTORY) &&
              matchingIndexes.length > 0,
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
          this.moveButtonErrorText =
            'EXPLORER.ERRORS.MOVE_FILE_ALREADY_EXISTS_ERROR';
          return true;
        }

        if (
          matchingIndexes.length > 0 &&
          !this.matSelectionList.selectedOptions.hasValue()
        ) {
          this.moveButtonErrorText = 'EXPLORER.ERRORS.MOVE_SAME_NAME_ERROR';
          return true;
        }

        this.moveButtonErrorText = '';
        return false;
      }),
      tap(() => {
        setTimeout(() => {
          this.cdRef.detectChanges();
        }, 0);
      }),
    );
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
    this.path$.next(this.navigationHistoryStack.pop(true) ?? '/');
  }

  createNewFolder(): void {
    /** TODO
     *   Implement
     */
  }

  reject(): void {
    this.dialogRef.close();
  }

  resolve(): void {
    if (this.matSelectionList.selectedOptions.hasValue()) {
      const paths = this.buildPaths(
        this.matSelectionList.selectedOptions.selected[0].value.fullPath,
        this.data.fsObjects,
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

  openByPath(path: string): void {
    this.path$.next(path);
    this.navigationHistoryStack.push(path);
  }
}
