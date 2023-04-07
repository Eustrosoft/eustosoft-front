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
  concatMap,
  delay,
  EMPTY,
  filter,
  finalize,
  from,
  map,
  mergeMap,
  Observable,
  of,
  share,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  toArray,
} from 'rxjs';
import {
  ChunkedFileRequest,
  CmsRequestInterface,
  CmsResponseInterface,
  CreateRequest,
  CreateResponse,
  DeleteRequest,
  DeleteResponse,
  FileReaderService,
  FileSystemObject,
  FileSystemObjectTypes,
  MoveCopyRequest,
  MoveCopyResponse,
  TisRequest,
  TisResponse,
  ViewRequest,
  ViewResponse,
} from '@eustrosoft-front/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExplorerRequestBuilderService } from './services/explorer-request-builder.service';
import { ExplorerService } from './services/explorer.service';
import { HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { CreateRenameFolderDialogComponent } from './components/create-rename-folder-dialog/create-rename-folder-dialog.component';
import { CreateRenameDialogDataInterface } from './components/create-rename-folder-dialog/create-rename-dialog-data.interface';
import { MoveFolderDialogComponent } from './components/move-folder-dialog/move-folder-dialog.component';
import { ExplorerPathService } from './services/explorer-path.service';
import { MoveDialogDataInterface } from './components/move-folder-dialog/move-dialog-data.interface';
import { FilesystemTableComponent } from './components/filesystem-table/filesystem-table.component';
import { SelectionChange } from '@angular/cdk/collections';

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

  upload$!: Observable<any>;
  refreshFolders$ = new BehaviorSubject<boolean>(true);
  path$ = new BehaviorSubject<string>('/');

  content$!: Observable<FileSystemObject[]>;
  selected$!: Observable<FileSystemObject[]>;

  control = new FormControl<File[]>([], { nonNullable: true });
  progressBarValue$ = new BehaviorSubject<number>(0);
  currentFile$ = new BehaviorSubject<string>('');

  newButtonText = $localize`New`;

  private destroy$ = new Subject<void>();
  private emitBuffer$ = new Subject<void>();
  private fileSystemTableRendered$ = new Subject<void>();

  constructor(
    private fileReaderService: FileReaderService,
    private explorerRequestBuilderService: ExplorerRequestBuilderService,
    private explorerService: ExplorerService,
    private explorerPathService: ExplorerPathService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.content$ = combineLatest([this.path$, this.refreshFolders$]).pipe(
      switchMap(([path, refresh]) =>
        this.explorerRequestBuilderService.buildViewRequest(path)
      ),
      switchMap((request: CmsRequestInterface<ViewRequest>) =>
        this.explorerService.dispatch<ViewRequest, ViewResponse>(request)
      ),
      map((response: CmsResponseInterface<ViewResponse>) =>
        response.r.flatMap((r: ViewResponse) => r.content)
      ),
      tap(() => this.filesystemTableComponent.selection.clear()),
      share()
    );

    let uploadError = false;
    this.upload$ = this.control.valueChanges.pipe(
      buffer(this.emitBuffer$.pipe(takeUntil(this.destroy$))),
      mergeMap((files: File[][]) => from(files)),
      tap((files: File[]) => {
        if (files.length === 0 && !uploadError) {
          this.cd.markForCheck();
          this.snackBar.open($localize`Upload complete`, $localize`Close`);
          this.currentFile$.next('');
          this.progressBarValue$.next(0);
        }
      }),
      switchMap((files: File[]) =>
        of(files).pipe(
          concatMap((files: File[]) =>
            this.fileReaderService.splitBinary(files)
          ),
          concatMap(({ file, chunks }) => {
            return from(chunks).pipe(
              concatMap((chunk: Blob, currentChunk: number) => {
                const request =
                  this.explorerRequestBuilderService.buildBinaryChunkRequest(
                    file,
                    chunk,
                    currentChunk,
                    chunks.length
                  );
                const formData = new FormData();
                formData.set('file', chunk);
                formData.set('json', JSON.stringify(request));

                return combineLatest([
                  this.explorerService.uploadChunks(formData, {
                    'Content-Disposition': `form-data; name="file"; filename="${file.name}"`,
                  }),
                  of(file),
                  of(chunks),
                  of(currentChunk),
                ]);
              }),
              tap(([response, file, chunks, currentChunk]) => {
                this.currentFile$.next(file.name);
                this.progressBarValue$.next(
                  100 * ((currentChunk + 1) / chunks.length)
                );
              }),
              toArray()
            );
          }),
          delay(100),
          tap((value) => {
            const file = value[0][1];
            this.control.patchValue(
              this.control.value.filter((f: File) => f.name !== file.name)
            );
            this.emitBuffer$.next();
          }),
          catchError((err) => {
            uploadError = true;
            console.error(err);
            this.snackBar.open(
              $localize`Error making request`,
              $localize`Close`
            );
            this.control.patchValue([]);
            this.cd.markForCheck();
            return EMPTY;
          }),
          finalize(() => {
            // Called
            // Why?
          })
        )
      ),
      finalize(() => {
        console.log('call outer');
        // Not called at all
        // Why?
      })
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
    this.path$.next(path);
  }

  uploadFilesBase64(): void {
    if (this.control.value.length === 0) {
      this.snackBar.open($localize`Select files first`, $localize`Close`);
      return;
    }
    let uploadError = false;

    this.upload$ = this.fileReaderService.splitBase64(this.control.value).pipe(
      mergeMap((fc: { file: File; chunks: string[] }) =>
        this.explorerRequestBuilderService.buildChunkRequest(fc).pipe()
      ),
      tap((request: TisRequest) => {
        console.log(request);
      }),
      concatMap((query: TisRequest) => this.explorerService.upload(query)),
      tap(
        (response: {
          request: TisRequest;
          response: TisResponse;
          totalChunks: number;
          currentChunk: number;
        }) => {
          const req = response.request.requests[0] as ChunkedFileRequest;
          this.currentFile$.next(req.parameters.data.name);
          this.progressBarValue$.next(
            100 * ((response.currentChunk + 1) / response.totalChunks)
          );
        }
      ),
      catchError((err) => {
        uploadError = true;
        console.error(err);
        this.snackBar.open($localize`Error making request`, $localize`Close`);

        return EMPTY;
      }),
      finalize(() => {
        if (!uploadError) {
          this.snackBar.open($localize`Upload completed`, $localize`Close`);

          this.control.patchValue([]);
        }
      })
    );
  }

  uploadFilesBinary(): void {
    if (this.control.value.length === 0) {
      this.snackBar.open($localize`Select files first`, `Close`);
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

  deleteFile(index: number): void {
    const toDelete = this.control.value[index];
    this.control.value.splice(index, 1);
    this.control.patchValue(this.control.value);
    if (toDelete.name === this.currentFile$.getValue()) {
      this.emitBuffer$.next();
    }
  }

  startUpload(): void {
    this.uploadFilesBinary();
  }

  createFolder(): void {
    const dialogRef = this.dialog.open(CreateRenameFolderDialogComponent, {
      data: {
        title: $localize`New folder`,
        inputLabel: $localize`Folder name`,
        defaultInputValue: $localize`Untitled folder`,
        submitButtonText: $localize`Create`,
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
        switchMap((body: CmsRequestInterface<CreateRequest>) =>
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
        title: $localize`Rename folder`,
        inputLabel: $localize`New name`,
        defaultInputValue: row.fileName,
        submitButtonText: $localize`Rename`,
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
          return this.explorerRequestBuilderService.buildMoveRequest(
            [row],
            [`${folder}/${newName}`]
          );
        }),
        switchMap((body: CmsRequestInterface<MoveCopyRequest>) =>
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
      MoveFolderDialogComponent,
      MoveDialogDataInterface,
      string[]
    >(MoveFolderDialogComponent, {
      data: { fsObjects: rows },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((str) => typeof str !== 'undefined'),
        map((str) => str as string[]),
        switchMap((to: string[]) =>
          combineLatest([
            this.explorerRequestBuilderService.buildMoveRequest(rows, to),
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
          const path = to[0].substring(0, lastIndex);
          this.path$.next(path);
        }),
        take(1)
      )
      .subscribe();
  }

  copy(v: unknown): void {
    console.log(v);
  }

  delete(rows: FileSystemObject[]): void {
    const dialogRef = this.dialog.open<
      PromptDialogComponent,
      PromptDialogDataInterface,
      boolean
    >(PromptDialogComponent, {
      data: {
        title: 'Delete confirmation',
        text: `${rows.length} objects are marked for deletion. Proceed?`,
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
        switchMap((body: CmsRequestInterface<DeleteRequest>) =>
          this.explorerService.dispatch<DeleteRequest, DeleteResponse>(body)
        ),
        tap(() => this.refreshFolders$.next(true)),
        take(1)
      )
      .subscribe();
  }

  download(row: FileSystemObject): void {
    this.explorerService
      .getDownloadTicket(row.fullPath)
      .pipe(
        switchMap(({ ticket }) => this.explorerService.download(ticket)),
        tap((response: HttpResponse<Blob>) => {
          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(
            new Blob([response.body as Blob], { type: response.body?.type })
          );
          const contentDisposition = response.headers.get(
            'content-disposition'
          ) as string;
          downloadLink.download = contentDisposition
            .split(';')[1]
            .split('filename')[1]
            .split('=')[1]
            .trim();
          downloadLink.click();
        }),
        take(1)
      )
      .subscribe();
  }
}
