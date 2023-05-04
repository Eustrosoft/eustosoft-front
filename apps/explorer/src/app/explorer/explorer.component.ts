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
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  buffer,
  catchError,
  combineLatest,
  EMPTY,
  filter,
  map,
  mergeMap,
  Observable,
  of,
  share,
  Subject,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  tap,
  zip,
} from 'rxjs';
import {
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
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ExplorerUploadService } from './services/explorer-upload.service';
import { UploadingState } from './constants/enums/uploading-state.enum';
import { TranslateService } from '@ngx-translate/core';

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

  refreshFolders$ = new BehaviorSubject<boolean>(true);
  path$ = new BehaviorSubject<string>(
    localStorage.getItem('qtis-explorer-last-path') || '/'
  );

  content$!: Observable<FileSystemObject[]>;
  selected$!: Observable<FileSystemObject[]>;

  control = new FormControl<File[]>([], { nonNullable: true });
  uploadTypeControl = new FormControl<string>('binary', {
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
      disabled: true,
    },
  ];
  uploadItems$ = this.explorerUploadService.uploadItems$.asObservable();

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
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.content$ = combineLatest([this.path$, this.refreshFolders$]).pipe(
      tap(([path, refresh]) =>
        this.explorerPathService.updateLastPathState(path)
      ),
      switchMap(([path, refresh]) => {
        return this.explorerRequestBuilderService.buildViewRequest(path);
      }),
      switchMap((request: QtisRequestResponseInterface<ViewRequest>) =>
        this.explorerService.dispatch<ViewRequest, ViewResponse>(request)
      ),
      map((response: QtisRequestResponseInterface<ViewResponse>) =>
        response.r.flatMap((r: ViewResponse) => r.content)
      ),
      tap(() => this.filesystemTableComponent.selection.clear()),
      share(),
      catchError(() => EMPTY)
    );

    this.control.valueChanges
      .pipe(
        buffer(this.emitBuffer$.pipe(takeUntil(this.destroy$))),
        mergeMap((files: File[][]) => files),
        tap((files: File[]) => {
          console.log('Buffer', files);
          this.overlayHidden = false;
        }),
        switchMap((files) =>
          zip([
            of(
              files.map(
                (file) =>
                  ({
                    file,
                    progress: 0,
                    state: UploadingState.PENDING,
                    cancelled: false,
                  } as UploadItem)
              )
            ),
            this.uploadItems$,
          ])
        ),
        switchMap(([items, uploadItems]) => {
          if (uploadItems.length === 0) {
            return of(items);
          }
          const uniqueArray = uploadItems
            .concat(items)
            .filter(
              (obj, index, self) =>
                index === self.findIndex((t) => t.file.name === obj.file.name)
            )
            .filter((item: UploadItem) => !item.cancelled);
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
          this.snackBar.open(`Error making request`, `Close`);
          this.control.patchValue([]);
          this.cd.markForCheck();
          return EMPTY;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

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
    this.path$.next(path);
  }

  uploadFilesBinary(): void {
    if (this.control.value.length === 0) {
      this.snackBar.open(`Select files first`, `Close`);
      return;
    }
    this.emitBuffer$.next();
  }

  filesDroppedOnFolder(event: {
    files: File[];
    fsObj: FileSystemObject;
  }): void {
    this.control.patchValue(event.files);
    this.uploadFilesBinary();
  }

  removeItemFromUploadList(item: UploadItem): void {
    const index = this.control.value.findIndex(
      (file) => file.name === item.file.name
    );
    this.control.value.splice(index, 1);
    this.control.patchValue(this.control.value);
    if (item.state === UploadingState.UPLOADING) {
      this.emitBuffer$.next();
    }
  }

  overlayClose(items: UploadItem[]): void {
    this.explorerUploadService.uploadItems$.next(
      items.map((item) => ({
        ...item,
        cancelled: true,
      }))
    );
    this.control.patchValue([]);
    this.emitBuffer$.next();
    this.explorerUploadService.uploadItems$.next([]);
    this.overlayHidden = true;
  }

  startUpload(): void {
    this.uploadFilesBinary();
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
        take(1)
      )
      .subscribe();
  }

  download(rows: FileSystemObject[]): void {
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
        tap((event: HttpEvent<Blob>) => {
          if (event.type === HttpEventType.DownloadProgress) {
            if (event.total) {
              const progress = Math.round(100 * (event.loaded / event.total));
              console.log(progress);
            }
          } else if (event.type === HttpEventType.Response) {
            const blob = new Blob([event.body as Blob], {
              type: event.body?.type,
            });
            const link = document.createElement('a');
            const href = URL.createObjectURL(
              new Blob([blob], { type: event.body?.type })
            );
            link.href = href;
            const contentDisposition = event.headers.get(
              'content-disposition'
            ) as string;
            link.download = contentDisposition
              .split(';')[1]
              .split('filename')[1]
              .split('=')[1]
              .trim();
            link.click();
            URL.revokeObjectURL(href);
          }
        }),
        takeWhile((event) => event.type !== HttpEventType.Response)
      )
      .subscribe();
  }
}
