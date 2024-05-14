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
  signal,
  viewChild,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { map, merge, Observable, tap } from 'rxjs';
import {
  ExplorerFsObjectTypes,
  ExplorerPathService,
  FileSystemObject,
  MoveCopyDialogData,
} from '@eustrosoft-front/explorer-lib';
import {
  MatListModule,
  MatListOption,
  MatSelectionList,
} from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PreloaderComponent } from '@eustrosoft-front/common-ui';
import {
  AsyncPipe,
  NgFor,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgTemplateOutlet,
} from '@angular/common';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'eustrosoft-front-move-folder-dialog',
  templateUrl: './move-copy-dialog.component.html',
  styleUrls: ['./move-copy-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatButtonModule,
    MatIconModule,
    BreadcrumbsComponent,
    MatListModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    NgIf,
    PreloaderComponent,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgTemplateOutlet,
    MatDialogActions,
    MatTooltipModule,
    AsyncPipe,
    TranslateModule,
  ],
  providers: [ExplorerPathService],
})
export class MoveCopyDialogComponent implements AfterViewInit {
  readonly matSelectionList =
    viewChild.required<MatSelectionList>(MatSelectionList);

  private readonly dialogRef: MatDialogRef<MoveCopyDialogComponent> = inject(
    MatDialogRef<MoveCopyDialogComponent>,
  );
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly explorerPathService = inject(ExplorerPathService);

  protected readonly data = inject<MoveCopyDialogData>(MAT_DIALOG_DATA);
  protected readonly fsObjTypes = ExplorerFsObjectTypes;

  private currentSelectedOptionIndex = signal<number | null>(null);

  protected moveButtonDisabled$!: Observable<boolean>;

  protected moveButtonErrorText = signal<string>('');
  protected fsObjects$ = this.explorerPathService.getContents$();

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
    this.resolve();
  }

  ngAfterViewInit(): void {
    this.moveButtonDisabled$ = merge(
      this.matSelectionList().options.changes,
      this.matSelectionList().selectedOptions.changed,
    ).pipe(
      map(() => {
        const options = this.matSelectionList()
          .options.toArray()
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
              (value.type === ExplorerFsObjectTypes.FILE ||
                value.type === ExplorerFsObjectTypes.DIRECTORY) &&
              matchingIndexes.length > 0,
          ).length > 0;

        matchingIndexes.forEach((index: number) => {
          const item = this.matSelectionList().options.get(index);
          if (item) {
            item.disabled = true;
          }
        });

        if (
          objectsAlreadyExistsInFolder &&
          !this.matSelectionList().selectedOptions.hasValue()
        ) {
          this.moveButtonErrorText.set(
            'EXPLORER.ERRORS.MOVE_FILE_ALREADY_EXISTS_ERROR',
          );
          return true;
        }

        if (
          matchingIndexes.length > 0 &&
          !this.matSelectionList().selectedOptions.hasValue()
        ) {
          this.moveButtonErrorText.set('EXPLORER.ERRORS.MOVE_SAME_NAME_ERROR');
          return true;
        }

        this.moveButtonErrorText.set('');
        return false;
      }),
      tap(() => {
        setTimeout(() => {
          this.cdRef.detectChanges();
        }, 0);
      }),
    );
  }

  navigateForward(event: MouseEvent, object: FileSystemObject): void {
    event.stopPropagation();
    this.matSelectionList().deselectAll();
    this.explorerPathService.setPath(object.fullPath);
  }

  navigateBack(): void {
    this.matSelectionList().deselectAll();
    this.explorerPathService.navigateBack();
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
    if (this.matSelectionList().selectedOptions.hasValue()) {
      const paths = this.buildPaths(
        this.matSelectionList().selectedOptions.selected[0].value.fullPath,
        this.data.fsObjects,
      );
      this.dialogRef.close(paths);
    } else {
      const paths = this.buildPaths(
        this.explorerPathService.getPath()(),
        this.data.fsObjects,
      );
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
    const option = this.matSelectionList().options.get(index);
    if (!option || option.disabled) {
      return;
    }
    // if we don't have selected option yet, set it
    if (this.currentSelectedOptionIndex() === null) {
      this.currentSelectedOptionIndex.set(index);
      return;
    }
    // if different option is clicked
    if (this.currentSelectedOptionIndex() !== index) {
      this.currentSelectedOptionIndex.set(index);
    } else {
      // if click performed on currently selected option
      option.toggle();
      this.currentSelectedOptionIndex.set(null);
    }
  }

  openByPath(path: string): void {
    this.explorerPathService.setPath(path);
  }
}
