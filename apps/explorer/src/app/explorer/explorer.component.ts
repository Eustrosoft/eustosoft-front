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
  Option,
  PromptDialogComponent,
  PromptDialogDataInterface,
} from '@eustrosoft-front/common-ui';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  filter,
  iif,
  map,
  Observable,
  of,
  repeat,
  share,
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
  DownloadTicketRequest,
  DownloadTicketResponse,
  FileSystemObject,
  FileSystemObjectTypes,
  MoveCopyRequest,
  MoveCopyResponse,
  QtisRequestResponseInterface,
  Subsystems,
  SupportedLanguages,
  UploadItemForm,
  ViewRequest,
  ViewResponse,
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
import { DispatchService } from '@eustrosoft-front/security';
import { ExplorerUploadItemFormFactoryService } from './services/explorer-upload-item-form-factory.service';
import { UploadItemState } from './constants/enums/uploading-state.enum';

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
  private explorerUploadItemFormFactoryService = inject(
    ExplorerUploadItemFormFactoryService
  );

  private destroy$ = new Subject<void>();
  private fileSystemTableRendered$ = new Subject<void>();
  private startUpload$ = new Subject<void>();
  private uploadCancelled$ = new Subject<void>();

  refreshFolders$ = new BehaviorSubject<boolean>(true);
  path$ = new BehaviorSubject<string>(
    localStorage.getItem('qtis-explorer-last-path') || '/'
  );

  upload$!: Observable<any>;
  fileControlChanges$!: Observable<FormArray<FormGroup<UploadItemForm>>>;
  content$!: Observable<FileSystemObject[]>;
  selected$!: Observable<FileSystemObject[]>;

  fileControl = new FormControl<File[]>([], { nonNullable: true });
  uploadTypeControl = new FormControl<string>('hex', {
    nonNullable: true,
  });
  uploadTypeOptions: Option[] = [
    {
      value: 'binary',
      displayText: 'binary',
      disabled: false,
    },
    {
      value: 'base64',
      displayText: 'base64',
      disabled: false,
    },
    {
      value: 'hex',
      displayText: 'hex',
      disabled: false,
    },
  ];
  uploadItems$ = this.explorerUploadItemsService.uploadItems$.asObservable();
  emptyItems = this.fb.array<FormGroup<UploadItemForm>>([]);

  overlayHidden = false;

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
        return this.explorerRequestBuilderService.buildViewRequest(path);
      }),
      switchMap((request: QtisRequestResponseInterface<ViewRequest>) =>
        this.dispatchService.dispatch<ViewRequest, ViewResponse>(request).pipe(
          catchError((err: HttpErrorResponse) => {
            this.snackBar.open(
              err.error,
              this.translateService.instant('EXPLORER.ERRORS.CLOSE_BUTTON_TEXT')
            );

            return of<QtisRequestResponseInterface<ViewResponse>>({
              r: [
                {
                  s: Subsystems.CMS,
                  e: 0,
                  m: '',
                  l: SupportedLanguages.EN_US,
                  content: [],
                },
              ],
              t: 0,
            });
          })
        )
      ),
      map((response: QtisRequestResponseInterface<ViewResponse>) =>
        response.r.flatMap((r: ViewResponse) => r.content)
      ),
      tap(() => this.filesystemTableComponent.selection.clear()),
      share(),
      catchError((err) => {
        console.error(err);
        return of<FileSystemObject[]>([]);
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
        this.overlayHidden = false;
        return formArray;
      })
    );

    this.upload$ = combineLatest([
      this.uploadCancelled$.asObservable().pipe(startWith(undefined)),
      this.startUpload$.asObservable(),
    ]).pipe(
      switchMap(() =>
        this.explorerUploadItemsService.uploadItems$
          .asObservable()
          .pipe(take(1))
      ),
      switchMap((items) => {
        console.log(items.value.map((it) => it.uploadItem));
        return this.explorerUploadService.uploadHexString(
          items,
          this.path$.getValue()
        );
      }),
      // emit buffer after every file upload completion
      tap(() => {
        this.refreshFolders$.next(true);
      }),
      catchError((err) => {
        console.error(err);
        this.snackBar.open(
          this.translateService.instant('EXPLORER.ERRORS.REQUEST_ERROR_TEXT'),
          this.translateService.instant('EXPLORER.ERRORS.CLOSE_BUTTON_TEXT')
        );
        this.closeOverlay(
          this.explorerUploadItemsService.uploadItems$.getValue()
        );
        this.cd.markForCheck();
        return EMPTY;
      }),
      repeat()
    );

    this.selected$ = combineLatest([
      this.fileSystemTableRendered$,
      this.content$,
    ]).pipe(
      switchMap(() => this.filesystemTableComponent.selection.changed),
      map(
        (selection: SelectionChange<FileSystemObject>) =>
          selection.source.selected
      )
    );
  }

  ngAfterViewInit(): void {
    this.fileSystemTableRendered$.next();
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
      this.uploadCancelled$.next();
    }
    if (formArray.length === 0) {
      this.uploadOverlayComponent.closeOverlay.emit(
        this.fb.array<FormGroup<UploadItemForm>>([])
      );
    }
  }

  closeOverlay(items: FormArray<FormGroup<UploadItemForm>>): void {
    this.explorerUploadItemsService.uploadItems$.next(
      this.fb.array<FormGroup<UploadItemForm>>([])
    );
    this.uploadCancelled$.next();
    this.overlayHidden = true;
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
          'EXPLORER.CREATE_FOLDER_MODAL.TITLE'
        ),
        inputLabel: this.translateService.instant(
          'EXPLORER.CREATE_FOLDER_MODAL.INPUT_LABEL_TEXT'
        ),
        defaultInputValue: this.translateService.instant(
          'EXPLORER.CREATE_FOLDER_MODAL.DEFAULT_INPUT_VALUE'
        ),
        submitButtonText: this.translateService.instant(
          'EXPLORER.CREATE_FOLDER_MODAL.SUBMIT_BUTTON_TEXT'
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
          'EXPLORER.CREATE_FILE_MODAL.TITLE'
        ),
        inputLabel: this.translateService.instant(
          'EXPLORER.CREATE_FILE_MODAL.INPUT_LABEL_TEXT'
        ),
        defaultInputValue: this.translateService.instant(
          'EXPLORER.CREATE_FILE_MODAL.DEFAULT_INPUT_VALUE'
        ),
        submitButtonText: this.translateService.instant(
          'EXPLORER.CREATE_FILE_MODAL.SUBMIT_BUTTON_TEXT'
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
        title: this.translateService.instant('EXPLORER.RENAME_MODAL.TITLE'),
        inputLabel: this.translateService.instant(
          'EXPLORER.RENAME_MODAL.INPUT_LABEL_TEXT'
        ),
        defaultInputValue: row.fileName,
        submitButtonText: this.translateService.instant(
          'EXPLORER.RENAME_MODAL.SUBMIT_BUTTON_TEXT'
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
        title: this.translateService.instant('EXPLORER.MOVE_MODAL.TITLE'),
        cancelButtonText: this.translateService.instant(
          'EXPLORER.MOVE_MODAL.CANCEL_BUTTON_TEXT'
        ),
        submitButtonText: this.translateService.instant(
          'EXPLORER.MOVE_MODAL.SUBMIT_BUTTON_TEXT'
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
        title: this.translateService.instant('EXPLORER.COPY_MODAL.TITLE'),
        cancelButtonText: this.translateService.instant(
          'EXPLORER.COPY_MODAL.CANCEL_BUTTON_TEXT'
        ),
        submitButtonText: this.translateService.instant(
          'EXPLORER.COPY_MODAL.SUBMIT_BUTTON_TEXT'
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
        title: this.translateService.instant('EXPLORER.DELETE_MODAL.TITLE'),
        text: this.translateService.instant('EXPLORER.DELETE_MODAL.TEXT', {
          count: rows.length,
          objectsWord: rows.length > 1 ? 'objects' : 'object',
        }),
        cancelButtonText: this.translateService.instant(
          'EXPLORER.DELETE_MODAL.CANCEL_BUTTON_TEXT'
        ),
        submitButtonText: this.translateService.instant(
          'EXPLORER.DELETE_MODAL.SUBMIT_BUTTON_TEXT'
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

  downloadViaTicket(rows: FileSystemObject[]): void {
    this.explorerRequestBuilderService
      .buildDownloadTicketRequests(rows)
      .pipe(
        switchMap((body) =>
          this.dispatchService.dispatch<
            DownloadTicketRequest,
            DownloadTicketResponse
          >(body)
        ),
        map((response: QtisRequestResponseInterface<DownloadTicketResponse>) =>
          response.r.map((res) => res.m)
        ),
        switchMap((tickets: string[]) =>
          this.explorerService.download(tickets[0])
        ),
        tap((url: string) => {
          window.location.href = url;
        }),
        catchError((err) => this.handleError(err)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  downloadViaPath(rows: FileSystemObject[]): void {
    this.explorerService
      .download(rows[0].fullPath, CmsDownloadParams.PATH)
      .pipe(
        tap((url: string) => {
          window.location.href = url;
        }),
        catchError((err) => this.handleError(err)),
        takeUntil(this.destroy$)
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
