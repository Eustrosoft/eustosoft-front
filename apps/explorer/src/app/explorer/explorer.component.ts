/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  BreakpointsService,
  InputFileComponent,
  PreloaderComponent,
  PromptDialogComponent,
  PromptDialogData,
} from '@eustrosoft-front/common-ui';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  filter,
  map,
  merge,
  Observable,
  of,
  repeat,
  startWith,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { DispatchService, QtisRequestResponse } from '@eustrosoft-front/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CreateDialogData,
  CreateDialogReturnData,
  DeleteRequest,
  DeleteResponse,
  ExplorerDownloadParams,
  ExplorerFsObjectTypes,
  ExplorerPathService,
  ExplorerRequestActions,
  ExplorerRequestBuilderService,
  ExplorerService,
  ExplorerUploadItemFormFactoryService,
  ExplorerUploadItemsService,
  ExplorerUploadService,
  FileSystemObject,
  FilesystemTableService,
  MoveCopyDialogData,
  MoveCopyRequest,
  MoveCopyResponse,
  RenameDialogData,
  RenameDialogReturnData,
  ShareDialogData,
  UploadItemForm,
  UploadItemState,
} from '@eustrosoft-front/explorer-lib';
import { MatDialog } from '@angular/material/dialog';
import { CreateDialogComponent } from './components/create-dialog/create-dialog.component';
import { SelectionChange } from '@angular/cdk/collections';
import { MoveCopyDialogComponent } from './components/move-copy-dialog/move-copy-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UploadOverlayComponent } from './components/upload-overlay/upload-overlay.component';
import { UploadDialogComponent } from './components/upload-dialog/upload-dialog.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { AsyncPipe, DOCUMENT, NgIf } from '@angular/common';
import { ShareDialogComponent } from './components/share-dialog/share-dialog.component';
import { RenameDialogComponent } from './components/rename-dialog/rename-dialog.component';
import { FilesystemTableComponent } from './components/filesystem-table/filesystem-table.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { SecurityLevels } from '@eustrosoft-front/security';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'eustrosoft-front-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    NgIf,
    InputFileComponent,
    BreadcrumbsComponent,
    PreloaderComponent,
    FilesystemTableComponent,
    UploadOverlayComponent,
    AsyncPipe,
    TranslateModule,
  ],
})
export class ExplorerComponent implements OnInit {
  @ViewChild(InputFileComponent) inputFileComponent!: InputFileComponent;
  @ViewChild(UploadOverlayComponent)
  uploadOverlayComponent!: UploadOverlayComponent;

  private readonly dispatchService = inject(DispatchService);
  private readonly explorerRequestBuilderService = inject(
    ExplorerRequestBuilderService,
  );
  private readonly explorerService = inject(ExplorerService);
  private readonly explorerPathService = inject(ExplorerPathService);
  private readonly explorerUploadService = inject(ExplorerUploadService);
  private readonly explorerUploadItemsService = inject(
    ExplorerUploadItemsService,
  );
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly translateService = inject(TranslateService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly clipboard = inject(Clipboard);
  private readonly document = inject(DOCUMENT);
  private readonly explorerUploadItemFormFactoryService = inject(
    ExplorerUploadItemFormFactoryService,
  );
  private readonly breakpointsService = inject(BreakpointsService);
  protected readonly filesystemTableService = inject(FilesystemTableService);
  protected readonly isSm = this.breakpointsService.isSm();

  private readonly startUpload$ = new Subject<void>();
  private readonly fileUploadCancelled$ = new Subject<void>();
  private readonly teardownUpload$ = new Subject<void>();

  protected readonly refresh$ = new Subject<void>();
  protected readonly path$ = new BehaviorSubject<string>(
    this.explorerPathService.getLastPathState(),
  );
  protected readonly currentFolder$ = new BehaviorSubject<
    FileSystemObject | undefined
  >(undefined);
  protected upload$!: Observable<unknown>;
  protected fileControlChanges$!: Observable<
    FormArray<FormGroup<UploadItemForm>>
  >;
  protected content$: Observable<{
    isLoading: boolean;
    isError: boolean;
    content: FileSystemObject[] | undefined;
  }> = combineLatest([
    this.path$.asObservable(),
    this.refresh$.asObservable().pipe(startWith(undefined)),
  ]).pipe(
    switchMap(([path]) => {
      this.explorerPathService.setLastPathState(path);
      return this.explorerService.getContents(path).pipe(
        // startWith({ isLoading: true, isError: false, content: undefined })
        catchError((err: HttpErrorResponse) => {
          this.path$.next('/');
          this.snackBar.open(err.error, 'close');
          return EMPTY;
        }),
      );
    }),
    startWith({ isLoading: true, isError: false, content: undefined }),
  );

  protected selectedRows$ = this.filesystemTableService.selection.changed
    .asObservable()
    .pipe(
      map(
        (selection: SelectionChange<FileSystemObject>) =>
          selection.source.selected,
      ),
    );

  protected fileControl = new FormControl<File[]>([], { nonNullable: true });

  protected overlayHidden = true;

  ngOnInit(): void {
    this.initializePathObs();
    this.initializeUploadObs();
  }

  initializePathObs(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map((query) => query.get('path') ?? undefined),
        filter(
          (queryPath): queryPath is string => typeof queryPath !== 'undefined',
        ),
        tap((path) => {
          this.explorerPathService.setLastPathState(path);
          this.clearQueryParams();
          this.path$.next(path);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  initializeUploadObs(): void {
    this.fileControlChanges$ = this.fileControl.valueChanges.pipe(
      map((files) => {
        const formArray =
          this.explorerUploadItemFormFactoryService.makeUploadItemsForm(
            files,
            this.path$.getValue(),
            (this.currentFolder$.getValue()?.securityLevel
              .value as SecurityLevels) ?? SecurityLevels.PUBLIC_PLUS,
          );
        this.explorerUploadItemsService.uploadItems$.next(formArray);
        // this.overlayHidden = false;
        return formArray;
      }),
    );

    this.upload$ = combineLatest([
      this.fileUploadCancelled$.asObservable().pipe(startWith(undefined)),
      this.startUpload$.asObservable(),
    ]).pipe(
      switchMap(() =>
        this.explorerUploadService
          .uploadHexString(this.path$.getValue())
          .pipe(takeUntil(this.teardownUpload$)),
      ),
      tap(() => {
        this.closeOverlay();
        this.refresh$.next();
      }),
      catchError((err: HttpErrorResponse) => {
        this.snackBar.open(err.error, 'close');
        this.inputFileComponent.clear();
        this.closeOverlay();
        return EMPTY;
      }),
      repeat(),
    );
  }

  open(fsElem: FileSystemObject): void {
    if (fsElem.type !== ExplorerFsObjectTypes.DIRECTORY) {
      return;
    }
    this.filesystemTableService.selection.clear();
    this.path$.next(fsElem.fullPath);
    this.currentFolder$.next(fsElem);
  }

  openByPath(path: string): void {
    this.filesystemTableService.selection.clear();
    this.path$.next(path);
  }

  filesDroppedOnFolder(event: {
    files: File[];
    fsObj: FileSystemObject;
  }): void {
    this.fileControl.patchValue(event.files);
  }

  removeItemFromUploadList(data: {
    item: FormGroup<UploadItemForm>;
    index: number;
  }): void {
    const formArray = this.explorerUploadItemsService.uploadItems$.getValue();
    formArray.removeAt(data.index);
    this.explorerUploadItemsService.uploadItems$.next(formArray);
    if (
      data.item.controls.uploadItem.value.state === UploadItemState.UPLOADING
    ) {
      this.fileUploadCancelled$.next();
    }
    if (formArray.length === 0) {
      this.closeOverlay();
    }
  }

  closeOverlay(): void {
    this.explorerUploadItemsService.uploadItems$.next(
      this.fb.array<FormGroup<UploadItemForm>>([]),
    );
    this.teardownUpload$.next();
    this.overlayHidden = true;
    this.inputFileComponent.clear();
  }

  startUpload(): void {
    this.startUpload$.next();
  }

  createFolder(): void {
    const dialogRef = this.dialog.open<
      CreateDialogComponent,
      CreateDialogData,
      CreateDialogReturnData
    >(CreateDialogComponent, {
      data: {
        nameInputDefaultValue:
          'EXPLORER.CREATE_FOLDER_DIALOG.NAME_INPUT_DEFAULT_VALUE',
        securityLevelSelectDefaultValue:
          (this.currentFolder$.getValue()?.securityLevel
            .value as SecurityLevels) ?? SecurityLevels.PUBLIC_PLUS,
        descriptionInputDefaultValue: '',
      },
      minWidth: '40vw',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter(
          (data): data is CreateDialogReturnData => typeof data !== 'undefined',
        ),
        switchMap((data) =>
          this.explorerService.create(
            this.path$.getValue(),
            data.name,
            ExplorerFsObjectTypes.DIRECTORY,
            data.description,
            data.securityLevel,
          ),
        ),
        tap(() => {
          this.refresh$.next();
        }),
        take(1),
      )
      .subscribe();
  }

  rename(row: FileSystemObject): void {
    const dialogRef = this.dialog.open<
      RenameDialogComponent,
      RenameDialogData,
      RenameDialogReturnData
    >(RenameDialogComponent, {
      data: {
        nameInputValue: row.fileName,
        descriptionInputValue: row.description,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter(
          (str): str is RenameDialogReturnData => typeof str !== 'undefined',
        ),
        switchMap((data) => this.explorerService.move(row, data)),
        tap(() => {
          this.refresh$.next();
        }),
        take(1),
      )
      .subscribe();
  }

  move(rows: FileSystemObject[]): void {
    const dialogRef = this.dialog.open<
      MoveCopyDialogComponent,
      MoveCopyDialogData,
      string[]
    >(MoveCopyDialogComponent, {
      data: {
        title: 'EXPLORER.MOVE_DIALOG.TITLE',
        cancelButtonText: 'EXPLORER.MOVE_DIALOG.CANCEL_BUTTON_TEXT',
        submitButtonText: 'EXPLORER.MOVE_DIALOG.SUBMIT_BUTTON_TEXT',
        fsObjects: rows,
        defaultPath: this.path$.getValue(),
      },
      minWidth: this.isSm ? '90vw' : '50vw',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((str): str is string[] => typeof str !== 'undefined'),
        switchMap((to) =>
          combineLatest([
            this.explorerRequestBuilderService.buildMoveCopyRequest(
              rows,
              to,
              ExplorerRequestActions.MOVE,
            ),
            of(to),
          ]),
        ),
        switchMap(([body, to]) =>
          combineLatest([
            this.dispatchService.dispatch<MoveCopyRequest, MoveCopyResponse>(
              body,
            ),
            of(to),
          ]),
        ),
        tap(([_, to]) => {
          const lastIndex = to[0].lastIndexOf('/');
          const path = to[0].substring(0, lastIndex) || '/';
          this.path$.next(path);
        }),
        catchError((err) => this.explorerService.handleError(err)),
        take(1),
      )
      .subscribe();
  }

  copy(rows: FileSystemObject[]): void {
    const dialogRef = this.dialog.open<
      MoveCopyDialogComponent,
      MoveCopyDialogData,
      string[]
    >(MoveCopyDialogComponent, {
      data: {
        title: 'EXPLORER.COPY_DIALOG.TITLE',
        cancelButtonText: 'EXPLORER.COPY_DIALOG.CANCEL_BUTTON_TEXT',
        submitButtonText: 'EXPLORER.COPY_DIALOG.SUBMIT_BUTTON_TEXT',
        fsObjects: rows,
        defaultPath: this.path$.getValue(),
      },
      minWidth: this.isSm ? '90vw' : '50vw',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((str) => typeof str !== 'undefined'),
        map((str) => str as string[]),
        switchMap((to: string[]) =>
          combineLatest([
            this.explorerRequestBuilderService.buildMoveCopyRequest(
              rows,
              to,
              ExplorerRequestActions.COPY,
            ),
            of(to),
          ]),
        ),
        switchMap(([body, to]) =>
          combineLatest([
            this.dispatchService.dispatch<MoveCopyRequest, MoveCopyResponse>(
              body,
            ),
            of(to),
          ]),
        ),
        tap(([_copyResponse, to]) => {
          const lastIndex = to[0].lastIndexOf('/');
          const path = to[0].substring(0, lastIndex);
          this.path$.next(path);
        }),
        catchError((err) => this.explorerService.handleError(err)),
        take(1),
      )
      .subscribe();
  }

  delete(rows: FileSystemObject[]): void {
    const dialogRef = this.dialog.open<
      PromptDialogComponent,
      PromptDialogData,
      boolean
    >(PromptDialogComponent, {
      data: {
        title: this.translateService.instant('EXPLORER.DELETE_DIALOG.TITLE'),
        text: this.translateService.instant('EXPLORER.DELETE_DIALOG.TEXT', {
          count: rows.length,
          objectsWord: rows.length > 1 ? 'objects' : 'object',
        }),
        cancelButtonText: this.translateService.instant(
          'EXPLORER.DELETE_DIALOG.CANCEL_BUTTON_TEXT',
        ),
        submitButtonText: this.translateService.instant(
          'EXPLORER.DELETE_DIALOG.SUBMIT_BUTTON_TEXT',
        ),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((v) => Boolean(v)),
        switchMap(() =>
          this.explorerRequestBuilderService.buildDeleteRequests(rows),
        ),
        switchMap((body: QtisRequestResponse<DeleteRequest>) =>
          this.dispatchService.dispatch<DeleteRequest, DeleteResponse>(body),
        ),
        tap(() => {
          this.refresh$.next();
          this.filesystemTableService.selection.clear();
        }),
        catchError((err) => this.explorerService.handleError(err)),
        take(1),
      )
      .subscribe();
  }

  downloadViaPath(rows: FileSystemObject[]): void {
    this.explorerService
      .makeDownloadLink(rows[0].fullPath, ExplorerDownloadParams.PATH)
      .pipe(
        tap((url: string) => {
          this.document.location.href = url;
        }),
        catchError((err) => this.explorerService.handleError(err)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  openPreview(row: FileSystemObject): void {
    if (row.previewRoute === undefined) {
      this.snackBar.open(
        this.translateService.instant('EXPLORER.PREVIEW_IS_NOT_AVAILABLE'),
        'close',
      );
      return;
    }
    this.explorerService
      .makeDownloadLink(row.fullPath, ExplorerDownloadParams.PATH)
      .pipe(
        tap((link) => {
          this.router.navigate([row.previewRoute], {
            state: { link, extension: row.fileName.split('.').pop() },
          });
        }),
        take(1),
      )
      .subscribe();
  }

  shareLink(rows: FileSystemObject[]): void {
    const shareLinkObs$ = this.explorerService.makeShareLink(rows[0].fullPath);

    const shareOWikiLinkObs$ = this.explorerService.makeOWikiShareLink(
      rows[0].fullPath,
    );

    const dialogRef = this.dialog.open<
      ShareDialogComponent,
      ShareDialogData,
      string
    >(ShareDialogComponent, {
      data: {
        shareLinkObs$,
        shareOWikiLinkObs$,
      },
      minWidth: this.isSm ? '100vw' : '50vw',
    });

    const dialogClosed$ = dialogRef.afterClosed();

    merge(
      dialogRef.componentInstance.shareUrlCopied,
      dialogRef.componentInstance.shareOWikiUrlCopied,
    )
      .pipe(
        tap((url) => {
          this.clipboard.copy(url);
          this.snackBar.open(
            this.translateService.instant('EXPLORER.LINK_COPIED_TO_CLIPBOARD'),
            'close',
            { duration: 2000 },
          );
        }),
        takeUntil(dialogClosed$),
      )
      .subscribe();
  }

  openUploadDialog(): void {
    const dialogRef = this.dialog.open<UploadDialogComponent, undefined, void>(
      UploadDialogComponent,
      {
        width: this.isSm ? '100vw' : '50vw',
      },
    );

    const dialogClosed$ = dialogRef.afterClosed();

    dialogRef.componentInstance.fileSelectClicked
      .pipe(
        tap(() => {
          this.inputFileComponent.fileInput.nativeElement.click();
        }),
        takeUntil(dialogClosed$),
      )
      .subscribe();

    dialogRef.componentInstance.startUploadClicked
      .pipe(
        tap(() => {
          this.startUpload$.next();
        }),
        takeUntil(dialogClosed$),
      )
      .subscribe();

    merge(
      dialogRef.componentInstance.cancelUploadClicked,
      dialogRef.componentInstance.removeItem,
      dialogRef.backdropClick(),
    )
      .pipe(
        tap(() => {
          this.closeOverlay();
          dialogRef.close();
        }),
        takeUntil(dialogClosed$),
      )
      .subscribe();

    this.teardownUpload$
      .asObservable()
      .pipe(
        tap(() => {
          dialogRef.close();
        }),
        takeUntil(dialogClosed$),
      )
      .subscribe();
  }

  clearQueryParams(): void {
    this.router.navigate([], {
      queryParams: null,
      queryParamsHandling: null,
    });
  }
}
