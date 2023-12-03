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
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  InputFileComponent,
  PromptDialogComponent,
  PromptDialogDataInterface,
} from '@eustrosoft-front/common-ui';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  delay,
  EMPTY,
  filter,
  iif,
  map,
  merge,
  Observable,
  of,
  repeat,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import {
  CmsDownloadParams,
  CmsRequestActions,
  CreateRequest,
  CreateResponse,
  DeleteRequest,
  DeleteResponse,
  DispatchService,
  FileSystemObjectTypes,
  MoveCopyRequest,
  MoveCopyResponse,
  QtisRequestResponseInterface,
  UploadItemForm,
} from '@eustrosoft-front/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExplorerRequestBuilderService } from './services/explorer-request-builder.service';
import { ExplorerService } from './services/explorer.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateRenameFolderDialogComponent } from './components/create-rename-folder-dialog/create-rename-folder-dialog.component';
import { CreateRenameDialogDataInterface } from './components/create-rename-folder-dialog/create-rename-dialog-data.interface';
import { ExplorerPathService } from './services/explorer-path.service';
import { FilesystemTableComponent } from './components/filesystem-table/filesystem-table.component';
import { SelectionChange } from '@angular/cdk/collections';
import { MoveCopyDialogComponent } from './components/move-copy-dialog/move-copy-dialog.component';
import { MoveCopyDialogDataInterface } from './components/move-copy-dialog/move-copy-dialog-data.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { ExplorerUploadService } from './services/explorer-upload.service';
import { TranslateService } from '@ngx-translate/core';
import { ExplorerUploadItemsService } from './services/explorer-upload-items.service';
import { UploadOverlayComponent } from './components/upload-overlay/upload-overlay.component';
import { ExplorerUploadItemFormFactoryService } from './services/explorer-upload-item-form-factory.service';
import { UploadItemState } from './constants/enums/uploading-state.enum';
import { UploadDialogComponent } from './components/upload-dialog/upload-dialog.component';
import { UploadDialogDataInterface } from './components/upload-dialog/upload-dialog-data.interface';
import { FileSystemObject } from './models/file-system-object.interface';
import { Clipboard } from '@angular/cdk/clipboard';
import { DOCUMENT } from '@angular/common';
import { ShareDialogComponent } from './components/share-dialog/share-dialog.component';
import { ShareDialogDataInterface } from './components/share-dialog/share-dialog-data.interface';

@Component({
  selector: 'eustrosoft-front-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(InputFileComponent) inputFileComponent!: InputFileComponent;
  @ViewChild(FilesystemTableComponent)
  filesystemTableComponent!: FilesystemTableComponent;
  @ViewChild(UploadOverlayComponent)
  uploadOverlayComponent!: UploadOverlayComponent;

  private dispatchService = inject(DispatchService);
  private explorerRequestBuilderService = inject(ExplorerRequestBuilderService);
  private explorerService = inject(ExplorerService);
  private explorerPathService = inject(ExplorerPathService);
  private explorerUploadService = inject(ExplorerUploadService);
  private explorerUploadItemsService = inject(ExplorerUploadItemsService);
  private snackBar = inject(MatSnackBar);
  private cd = inject(ChangeDetectorRef);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private translateService = inject(TranslateService);
  private activatedRoute = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private clipboard = inject(Clipboard);
  private document = inject(DOCUMENT);
  private explorerUploadItemFormFactoryService = inject(
    ExplorerUploadItemFormFactoryService
  );

  private destroy$ = new Subject<void>();
  private fileSystemTableRendered$ = new Subject<void>();
  private startUpload$ = new Subject<void>();
  private fileUploadCancelled$ = new Subject<void>();
  private teardownUpload$ = new Subject<void>();

  refreshFolders$ = new BehaviorSubject<boolean>(true);
  path$ = new BehaviorSubject<string>(
    localStorage.getItem('qtis-explorer-last-path') || '/'
  );

  upload$!: Observable<any>;
  fileControlChanges$!: Observable<FormArray<FormGroup<UploadItemForm>>>;
  content$!: Observable<{
    isLoading: boolean;
    isError: boolean;
    content: FileSystemObject[] | undefined;
  }>;
  selectedRows$!: Observable<FileSystemObject[]>;

  fileControl = new FormControl<File[]>([], { nonNullable: true });

  overlayHidden = true;

  ngOnInit(): void {
    this.content$ = combineLatest([this.path$, this.refreshFolders$]).pipe(
      switchMap(([path]) =>
        combineLatest([of(path), this.activatedRoute.queryParamMap])
      ),
      switchMap(([path, queryParamMap]) =>
        iif(
          () => queryParamMap.get('path') !== null,
          of<string>(queryParamMap.get('path') as string),
          of<string>(path)
        )
      ),
      switchMap((path) => {
        this.explorerPathService.updateLastPathState(path);
        return this.explorerService
          .getContents(path)
          .pipe
          // startWith({ isLoading: true, isError: false, content: undefined })
          ();
      }),
      startWith({ isLoading: true, isError: false, content: undefined }),
      shareReplay(1),
      catchError((err: HttpErrorResponse) => {
        console.error(err);
        this.snackBar.open(
          err.error,
          this.translateService.instant('EXPLORER.ERRORS.CLOSE_BUTTON_TEXT')
        );
        return of({ isLoading: true, isError: true, content: undefined });
      })
    );

    this.fileControlChanges$ = this.fileControl.valueChanges.pipe(
      map((files) => {
        const formArray =
          this.explorerUploadItemFormFactoryService.makeUploadItemsForm(
            files,
            this.path$.getValue()
          );
        this.explorerUploadItemsService.uploadItems$.next(formArray);
        // this.overlayHidden = false;
        return formArray;
      })
    );

    this.upload$ = combineLatest([
      this.fileUploadCancelled$.asObservable().pipe(startWith(undefined)),
      this.startUpload$.asObservable(),
    ]).pipe(
      switchMap(() =>
        this.explorerUploadService
          .uploadHexString(this.path$.getValue())
          .pipe(takeUntil(this.teardownUpload$))
      ),
      tap(() => {
        console.log('teardownUpload$ call');
        this.teardownUpload$.next();
        this.refreshFolders$.next(true);
      }),
      catchError((err) => {
        console.error(err);
        this.snackBar.open(
          this.translateService.instant('EXPLORER.ERRORS.REQUEST_ERROR_TEXT'),
          this.translateService.instant('EXPLORER.ERRORS.CLOSE_BUTTON_TEXT')
        );
        this.inputFileComponent.clear();
        this.closeOverlay();
        this.cd.markForCheck();

        return EMPTY;
      }),
      repeat()
    );
  }

  ngAfterViewInit(): void {
    this.fileSystemTableRendered$.next();
    this.selectedRows$ = this.content$.pipe(
      delay(1),
      switchMap(() => this.filesystemTableComponent.selection.changed),
      map(
        (selection: SelectionChange<FileSystemObject>) =>
          selection.source.selected
      )
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  open(fsElem: FileSystemObject): void {
    if (fsElem.type !== FileSystemObjectTypes.DIRECTORY) {
      return;
    }
    this.clearQueryParams();
    this.filesystemTableComponent.selection.clear();
    this.path$.next(fsElem.fullPath);
  }

  openByPath(path: string) {
    this.clearQueryParams();
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
      this.fb.array<FormGroup<UploadItemForm>>([])
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
      CreateRenameFolderDialogComponent,
      CreateRenameDialogDataInterface
    >(CreateRenameFolderDialogComponent, {
      data: {
        title: this.translateService.instant(
          'EXPLORER.CREATE_FOLDER_DIALOG.TITLE'
        ),
        inputLabel: this.translateService.instant(
          'EXPLORER.CREATE_FOLDER_DIALOG.INPUT_LABEL_TEXT'
        ),
        defaultInputValue: this.translateService.instant(
          'EXPLORER.CREATE_FOLDER_DIALOG.DEFAULT_INPUT_VALUE'
        ),
        submitButtonText: this.translateService.instant(
          'EXPLORER.CREATE_FOLDER_DIALOG.SUBMIT_BUTTON_TEXT'
        ),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((str) => typeof str === 'string'),
        switchMap((folderName: string) =>
          this.explorerRequestBuilderService.buildCreateRequest(
            this.path$.getValue(),
            FileSystemObjectTypes.DIRECTORY,
            folderName
          )
        ),
        switchMap((body: QtisRequestResponseInterface<CreateRequest>) =>
          this.dispatchService.dispatch<CreateRequest, CreateResponse>(body)
        ),
        tap(() => {
          this.refreshFolders$.next(true);
        }),
        catchError((err) => this.handleError(err)),
        take(1)
      )
      .subscribe();
  }

  createFile(): void {
    const dialogRef = this.dialog.open<
      CreateRenameFolderDialogComponent,
      CreateRenameDialogDataInterface
    >(CreateRenameFolderDialogComponent, {
      data: {
        title: this.translateService.instant(
          'EXPLORER.CREATE_FILE_DIALOG.TITLE'
        ),
        inputLabel: this.translateService.instant(
          'EXPLORER.CREATE_FILE_DIALOG.INPUT_LABEL_TEXT'
        ),
        defaultInputValue: this.translateService.instant(
          'EXPLORER.CREATE_FILE_DIALOG.DEFAULT_INPUT_VALUE'
        ),
        submitButtonText: this.translateService.instant(
          'EXPLORER.CREATE_FILE_DIALOG.SUBMIT_BUTTON_TEXT'
        ),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((str) => typeof str === 'string'),
        switchMap((folderName: string) =>
          this.explorerRequestBuilderService.buildCreateRequest(
            this.path$.getValue(),
            FileSystemObjectTypes.FILE,
            folderName
          )
        ),
        switchMap((body: QtisRequestResponseInterface<CreateRequest>) =>
          this.dispatchService.dispatch<CreateRequest, CreateResponse>(body)
        ),
        tap(() => {
          this.refreshFolders$.next(true);
        }),
        catchError((err) => this.handleError(err)),
        take(1)
      )
      .subscribe();
  }

  rename(row: FileSystemObject): void {
    const dialogRef = this.dialog.open<
      CreateRenameFolderDialogComponent,
      CreateRenameDialogDataInterface,
      string
    >(CreateRenameFolderDialogComponent, {
      data: {
        title: this.translateService.instant('EXPLORER.RENAME_DIALOG.TITLE'),
        inputLabel: this.translateService.instant(
          'EXPLORER.RENAME_DIALOG.INPUT_LABEL_TEXT'
        ),
        defaultInputValue: row.fileName,
        submitButtonText: this.translateService.instant(
          'EXPLORER.RENAME_DIALOG.SUBMIT_BUTTON_TEXT'
        ),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((str) => typeof str !== 'undefined'),
        map((str) => str as string),
        switchMap((newName: string) => {
          const folder = this.explorerPathService.getFullPathToLastFolder(
            row.fullPath
          );
          return this.explorerRequestBuilderService.buildMoveCopyRequest(
            [row],
            [`${folder}/${newName}`],
            CmsRequestActions.MOVE
          );
        }),
        switchMap((body: QtisRequestResponseInterface<MoveCopyRequest>) =>
          this.dispatchService.dispatch<MoveCopyRequest, MoveCopyResponse>(body)
        ),
        tap(() => {
          this.refreshFolders$.next(true);
        }),
        catchError((err) => this.handleError(err)),
        take(1)
      )
      .subscribe();
  }

  move(rows: FileSystemObject[]): void {
    const dialogRef = this.dialog.open<
      MoveCopyDialogComponent,
      MoveCopyDialogDataInterface,
      string[]
    >(MoveCopyDialogComponent, {
      data: {
        title: this.translateService.instant('EXPLORER.MOVE_DIALOG.TITLE'),
        cancelButtonText: this.translateService.instant(
          'EXPLORER.MOVE_DIALOG.CANCEL_BUTTON_TEXT'
        ),
        submitButtonText: this.translateService.instant(
          'EXPLORER.MOVE_DIALOG.SUBMIT_BUTTON_TEXT'
        ),
        fsObjects: rows,
      },
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
              CmsRequestActions.MOVE
            ),
            of(to),
          ])
        ),
        switchMap(([body, to]) =>
          combineLatest([
            this.dispatchService.dispatch<MoveCopyRequest, MoveCopyResponse>(
              body
            ),
            of(to),
          ])
        ),
        tap(([moveResponse, to]) => {
          const lastIndex = to[0].lastIndexOf('/');
          const path = to[0].substring(0, lastIndex) || '/';
          this.path$.next(path);
        }),
        catchError((err) => this.handleError(err)),
        take(1)
      )
      .subscribe();
  }

  copy(rows: FileSystemObject[]): void {
    const dialogRef = this.dialog.open<
      MoveCopyDialogComponent,
      MoveCopyDialogDataInterface,
      string[]
    >(MoveCopyDialogComponent, {
      data: {
        title: this.translateService.instant('EXPLORER.COPY_DIALOG.TITLE'),
        cancelButtonText: this.translateService.instant(
          'EXPLORER.COPY_DIALOG.CANCEL_BUTTON_TEXT'
        ),
        submitButtonText: this.translateService.instant(
          'EXPLORER.COPY_DIALOG.SUBMIT_BUTTON_TEXT'
        ),
        fsObjects: rows,
      },
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
              CmsRequestActions.COPY
            ),
            of(to),
          ])
        ),
        switchMap(([body, to]) =>
          combineLatest([
            this.dispatchService.dispatch<MoveCopyRequest, MoveCopyResponse>(
              body
            ),
            of(to),
          ])
        ),
        tap(([copyResponse, to]) => {
          const lastIndex = to[0].lastIndexOf('/');
          const path = to[0].substring(0, lastIndex);
          this.path$.next(path);
        }),
        catchError((err) => this.handleError(err)),
        take(1)
      )
      .subscribe();
  }

  delete(rows: FileSystemObject[]): void {
    const dialogRef = this.dialog.open<
      PromptDialogComponent,
      PromptDialogDataInterface,
      boolean
    >(PromptDialogComponent, {
      data: {
        title: this.translateService.instant('EXPLORER.DELETE_DIALOG.TITLE'),
        text: this.translateService.instant('EXPLORER.DELETE_DIALOG.TEXT', {
          count: rows.length,
          objectsWord: rows.length > 1 ? 'objects' : 'object',
        }),
        cancelButtonText: this.translateService.instant(
          'EXPLORER.DELETE_DIALOG.CANCEL_BUTTON_TEXT'
        ),
        submitButtonText: this.translateService.instant(
          'EXPLORER.DELETE_DIALOG.SUBMIT_BUTTON_TEXT'
        ),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((v) => Boolean(v)),
        switchMap(() =>
          this.explorerRequestBuilderService.buildDeleteRequests(rows)
        ),
        switchMap((body: QtisRequestResponseInterface<DeleteRequest>) =>
          this.dispatchService.dispatch<DeleteRequest, DeleteResponse>(body)
        ),
        tap(() => this.refreshFolders$.next(true)),
        catchError((err) => this.handleError(err)),
        take(1)
      )
      .subscribe();
  }

  downloadViaPath(rows: FileSystemObject[]): void {
    this.explorerService
      .makeDownloadLink(rows[0].fullPath, CmsDownloadParams.PATH)
      .pipe(
        tap((url: string) => {
          this.document.location.href = url;
        }),
        catchError((err) => this.handleError(err)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  shareLink(rows: FileSystemObject[]) {
    const linkObs$ = this.explorerService
      .makeDownloadLink(rows[0].fullPath, CmsDownloadParams.PATH)
      .pipe(
        map((url) => ({
          isLoading: false,
          isError: false,
          link: this.document.location.origin + url,
        })),
        startWith({ isLoading: true, isError: false, link: undefined }),
        catchError(() =>
          of({ isLoading: false, isError: true, link: undefined })
        )
      );

    const dialogRef = this.dialog.open<
      ShareDialogComponent,
      ShareDialogDataInterface,
      string
    >(ShareDialogComponent, {
      data: {
        title: 'EXPLORER.SHARE_DIALOG.TITLE',
        inputLabel: 'EXPLORER.SHARE_DIALOG.INPUT_LABEL_TEXT',
        cancelButtonText: 'EXPLORER.SHARE_DIALOG.CANCEL_BUTTON_TEXT',
        submitButtonText: 'EXPLORER.SHARE_DIALOG.SUBMIT_BUTTON_TEXT',
        linkObs$,
      },
      width: '50vw',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((url) => typeof url !== 'undefined'),
        tap((url) => {
          this.clipboard.copy(url as string);
          this.snackBar.open(
            this.translateService.instant('EXPLORER.LINK_COPIED_TO_CLIPBOARD'),
            'close',
            { duration: 2000 }
          );
        }),
        take(1)
      )
      .subscribe();
  }

  openUploadDialog(): void {
    const dialogRef = this.dialog.open<
      UploadDialogComponent,
      UploadDialogDataInterface,
      void
    >(UploadDialogComponent, {
      data: {
        title: 'EXPLORER.UPLOAD_DIALOG.TITLE',
        selectFileButtonText: 'EXPLORER.UPLOAD_DIALOG.SELECT_FILE_BUTTON_TEXT',
        cancelButtonText: 'EXPLORER.UPLOAD_DIALOG.CANCEL_BUTTON_TEXT',
        startUploadButtonText:
          'EXPLORER.UPLOAD_DIALOG.START_UPLOAD_BUTTON_TEXT',
        uploadCompleteText: 'EXPLORER.UPLOAD_DIALOG.UPLOAD_COMPLETE_TEXT',
        securityLevelNoteText:
          'EXPLORER.UPLOAD_DIALOG.SUGGESTIONS.SECURITY_LVL_WARNING',
      },
      width: '50vw',
    });

    const dialogClosed$ = dialogRef.afterClosed();

    dialogRef.componentInstance.fileSelectClicked
      .pipe(
        tap(() => {
          this.inputFileComponent.fileInput.nativeElement.click();
        }),
        takeUntil(dialogClosed$)
      )
      .subscribe();

    dialogRef.componentInstance.startUploadClicked
      .pipe(
        tap(() => {
          this.startUpload$.next();
        }),
        takeUntil(dialogClosed$)
      )
      .subscribe();

    merge(
      dialogRef.componentInstance.cancelUploadClicked,
      dialogRef.componentInstance.removeItem,
      dialogRef.backdropClick()
    )
      .pipe(
        tap(() => {
          this.closeOverlay();
          dialogRef.close();
        }),
        takeUntil(dialogClosed$)
      )
      .subscribe();
  }

  clearQueryParams(): void {
    this.router.navigate([], {
      queryParams: null,
      queryParamsHandling: null,
    });
  }

  handleError(err: HttpErrorResponse): Observable<never> {
    this.snackBar.open(
      err.error,
      this.translateService.instant('EXPLORER.ERRORS.CLOSE_BUTTON_TEXT')
    );
    return EMPTY;
  }
}
