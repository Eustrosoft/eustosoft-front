import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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
  buffer,
  catchError,
  combineLatest,
  EMPTY,
  filter,
  iif,
  map,
  mergeMap,
  Observable,
  of,
  repeat,
  retry,
  share,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  zip,
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
  FileReaderService,
  FileSystemObject,
  FileSystemObjectTypes,
  MoveCopyRequest,
  MoveCopyResponse,
  QtisRequestResponseInterface,
  Subsystems,
  SupportedLanguages,
  UploadItem,
  ViewRequest,
  ViewResponse,
} from '@eustrosoft-front/core';
import { FormControl } from '@angular/forms';
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
import { UploadingState } from './constants/enums/uploading-state.enum';
import { TranslateService } from '@ngx-translate/core';
import { ExplorerUploadItemsService } from './services/explorer-upload-items.service';
import { UploadOverlayComponent } from './components/upload-overlay/upload-overlay.component';

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

  refreshFolders$ = new BehaviorSubject<boolean>(true);
  path$ = new BehaviorSubject<string>(
    localStorage.getItem('qtis-explorer-last-path') || '/'
  );

  content$!: Observable<FileSystemObject[]>;
  upload$!: Observable<any>;
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

  overlayHidden = true;

  private destroy$ = new Subject<void>();
  private emitBuffer$ = new Subject<void>();
  private fileSystemTableRendered$ = new Subject<void>();

  constructor(
    private fileReaderService: FileReaderService,
    private explorerRequestBuilderService: ExplorerRequestBuilderService,
    private explorerService: ExplorerService,
    private explorerPathService: ExplorerPathService,
    private explorerUploadService: ExplorerUploadService,
    private explorerUploadItemsService: ExplorerUploadItemsService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.content$ = combineLatest([
      this.path$.pipe(
        tap((path) => this.explorerPathService.updateLastPathState(path))
      ),
      this.refreshFolders$,
    ]).pipe(
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
      switchMap((path) =>
        this.explorerRequestBuilderService.buildViewRequest(path)
      ),
      switchMap((request: QtisRequestResponseInterface<ViewRequest>) =>
        this.explorerService.dispatch<ViewRequest, ViewResponse>(request).pipe(
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

    this.upload$ = this.fileControl.valueChanges.pipe(
      buffer(this.emitBuffer$.pipe(takeUntil(this.destroy$))),
      mergeMap((files: File[][]) => files),
      map((files: File[]) => {
        console.log('Buffer', files);
        this.overlayHidden = false;
        const uploadItems = files.map<UploadItem>((file) => ({
          file,
          progress: 0,
          state: UploadingState.PENDING,
          cancelled: false,
        }));
        return uploadItems;
      }),
      switchMap((files) =>
        zip([of(files), this.explorerUploadItemsService.uploadItems$])
      ),
      switchMap(([items, uploadItems]) => {
        const uniqueArray = uploadItems
          .concat(items)
          .filter(
            (obj, index, self) =>
              index === self.findIndex((t) => t.file.name === obj.file.name)
          )
          .filter((item: UploadItem) => !item.cancelled);
        this.explorerUploadItemsService.uploadItems$.next(uniqueArray);
        return of(uniqueArray);
      }),
      switchMap((items) => {
        switch (this.uploadTypeControl.value) {
          case 'binary':
            return this.explorerUploadService.uploadBinary(
              items,
              this.path$.getValue()
            );
          case 'hex':
            return this.explorerUploadService.uploadHexString(
              items,
              this.path$.getValue()
            );
          case 'base64':
            return this.explorerUploadService.uploadBase64(
              items,
              this.path$.getValue()
            );
          default:
            return this.explorerUploadService.uploadBinary(
              items,
              this.path$.getValue()
            );
        }
      }),
      // emit buffer after every file upload completion
      tap(() => {
        this.emitBuffer$.next();
        this.refreshFolders$.next(true);
      }),
      catchError((err) => {
        console.error(err);
        this.snackBar.open(
          this.translateService.instant('EXPLORER.ERRORS.REQUEST_ERROR_TEXT'),
          this.translateService.instant('EXPLORER.ERRORS.CLOSE_BUTTON_TEXT')
        );
        this.closeOverlay(this.explorerUploadItemsService.uploadItems$.value);
        this.cd.markForCheck();
        return EMPTY;
      }),
      repeat(),
      retry(5)
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
    this.emitBuffer$.next();
  }

  removeItemFromUploadList(item: UploadItem): void {
    const index = this.fileControl.value.findIndex(
      (file) => file.name === item.file.name
    );
    this.fileControl.value.splice(index, 1);
    this.fileControl.patchValue(this.fileControl.value);
    if (item.state === UploadingState.UPLOADING) {
      this.emitBuffer$.next();
    }
    if (this.explorerUploadItemsService.uploadItems$.value.length === 0) {
      this.uploadOverlayComponent.closeOverlay.emit([]);
    }
  }

  closeOverlay(items: UploadItem[]): void {
    this.explorerUploadItemsService.uploadItems$.next(
      items.map((item) => ({
        ...item,
        cancelled: true,
      }))
    );
    // this.control.patchValue([]);
    this.emitBuffer$.next();
    this.explorerUploadItemsService.uploadItems$.next([]);
    this.overlayHidden = true;
  }

  startUpload(): void {
    this.emitBuffer$.next();
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
          this.explorerService.dispatch<CreateRequest, CreateResponse>(body)
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
          this.explorerService.dispatch<CreateRequest, CreateResponse>(body)
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
          this.explorerService.dispatch<MoveCopyRequest, MoveCopyResponse>(body)
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
            this.explorerService.dispatch<MoveCopyRequest, MoveCopyResponse>(
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
            this.explorerService.dispatch<MoveCopyRequest, MoveCopyResponse>(
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
          this.explorerService.dispatch<DeleteRequest, DeleteResponse>(body)
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
          this.explorerService.dispatch<
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
