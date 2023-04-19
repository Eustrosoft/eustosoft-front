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
import { UploadItem } from './interfaces/upload-item.interface';
import { UploadingState } from './constants/enums/uploading-state.enum';

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
  uploadItems$ = this.explorerUploadService.uploadItems$.asObservable();

  newButtonText = `New`;
  uploadError = false;
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
    private dialog: MatDialog
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
      share()
    );

    this.control.valueChanges
      .pipe(
        filter((files) => files.length > 0),
        buffer(this.emitBuffer$.pipe(takeUntil(this.destroy$))),
        mergeMap((files: File[][]) => files),
        tap((files: File[]) => {
          console.log('Buffer', files);
          this.overlayHidden = false;
          if (files.length === 0 && !this.uploadError) {
            this.cd.markForCheck();
            this.snackBar.open(`Upload complete`, `Close`, { duration: 1000 });
            // this.refreshFolders$.next(true);
          }
        }),
        switchMap((files) => zip([of(files), this.uploadItems$])),
        switchMap(([files, items]) => {
          const uploadedFileNames = items
            .filter((item) => item.state === UploadingState.UPLOADED)
            .map((item) => item.file.name);
          const filesToUpload = files.filter(
            (file) => !uploadedFileNames.includes(file.name)
          );
          console.log('FilesToUpload', filesToUpload);
          return of(filesToUpload);
        }),
        switchMap((files: File[]) => this.explorerUploadService.upload(files)),
        tap((items) => {
          console.log(items);
          // const fileName = items[0][2].name;
          // this.control.patchValue(
          //   this.control.value.filter((f: File) => f.name !== fileName),
          //   { emitEvent: false }
          // );
          this.emitBuffer$.next();
        }),
        catchError((err) => {
          this.uploadError = true;
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

  overlayClosed(): void {
    console.log('Close clicked');
  }

  startUpload(): void {
    this.uploadFilesBinary();
  }

  createFolder(): void {
    const dialogRef = this.dialog.open(CreateRenameFolderDialogComponent, {
      data: {
        title: `New folder`,
        inputLabel: `Folder name`,
        defaultInputValue: `Untitled folder`,
        submitButtonText: `Create`,
      } as CreateRenameDialogDataInterface,
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

  rename(row: FileSystemObject): void {
    const dialogRef = this.dialog.open<
      CreateRenameFolderDialogComponent,
      CreateRenameDialogDataInterface,
      string
    >(CreateRenameFolderDialogComponent, {
      data: {
        title: `Rename folder`,
        inputLabel: `New name`,
        defaultInputValue: row.fileName,
        submitButtonText: `Rename`,
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
        title: 'Move to',
        cancelButtonText: 'Cancel',
        submitButtonText: 'Move',
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
        title: 'Copy to',
        cancelButtonText: 'Cancel',
        submitButtonText: 'Copy',
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
        title: 'Delete confirmation',
        text: `${rows.length} ${
          rows.length > 1 ? 'objects' : 'object'
        } are marked for deletion. Proceed?`,
        cancelButtonText: 'No',
        submitButtonText: 'Yes',
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

  // uploadFilesBase64(): void {
  //   if (this.control.value.length === 0) {
  //     this.snackBar.open(`Select files first`, `Close`);
  //     return;
  //   }
  //   let uploadError = false;
  //
  //   this.upload$ = this.fileReaderService.splitBase64(this.control.value).pipe(
  //     mergeMap((fc: { file: File; chunks: string[] }) =>
  //       this.explorerRequestBuilderService.buildChunkRequest(fc).pipe()
  //     ),
  //     tap((request: TisRequest) => {
  //       console.log(request);
  //     }),
  //     concatMap((query: TisRequest) => this.explorerService.upload(query)),
  //     tap(
  //       (response: {
  //         request: TisRequest;
  //         response: TisResponse;
  //         totalChunks: number;
  //         currentChunk: number;
  //       }) => {
  //         const req = response.request.requests[0] as ChunkedFileRequest;
  //         this.currentFile$.next(req.parameters.data.name);
  //         this.progressBarValue$.next(
  //           100 * ((response.currentChunk + 1) / response.totalChunks)
  //         );
  //       }
  //     ),
  //     catchError((err) => {
  //       uploadError = true;
  //       console.error(err);
  //       this.snackBar.open(`Error making request`, `Close`);
  //
  //       return EMPTY;
  //     }),
  //     finalize(() => {
  //       if (!uploadError) {
  //         this.snackBar.open(`Upload completed`, `Close`);
  //
  //         this.control.patchValue([]);
  //       }
  //     })
  //   );
  // }
}
