import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { InputFileComponent } from '@eustrosoft-front/common-ui';
import { ActivatedRoute, Router } from '@angular/router';
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
  mergeMap,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  toArray,
} from 'rxjs';
import {
  ChunkedFileRequest,
  FileReaderService,
  FileSystemObject,
  FileSystemObjectTypes,
  TisRequest,
  TisResponse,
} from '@eustrosoft-front/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';
import { ExplorerRequestBuilderService } from './services/explorer-request-builder.service';
import { ExplorerService } from './services/explorer.service';
import { HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { CreateRenameFolderDialogComponent } from './components/create-rename-folder-dialog/create-rename-folder-dialog.component';
import { CreateRenameDialogData } from './interfaces/create-rename-dialog-data.interface';
import { MoveFolderDialogComponent } from './components/move-folder-dialog/move-folder-dialog.component';

@Component({
  selector: 'eustrosoft-front-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerComponent implements OnInit, OnDestroy {
  @ViewChild(InputFileComponent) inputFileComponent!: InputFileComponent;
  upload$!: Observable<any>;
  refreshFolders$ = new BehaviorSubject<boolean>(true);

  folders$!: Observable<FileSystemObject[]>;

  displayedColumns: string[] = ['select', 'name', 'lastModified', 'actions'];
  dataSource = new MatTableDataSource<FileSystemObject>([]);
  selection = new SelectionModel<FileSystemObject>(true, []);

  control = new FormControl<File[]>([], { nonNullable: true });
  progressBarValue$ = new BehaviorSubject<number>(0);
  currentFile$ = new BehaviorSubject<string>('');

  fsObjTypes = FileSystemObjectTypes;
  newButtonText = $localize`New`;

  private destroy$ = new Subject<void>();
  private emitBuffer$ = new Subject<void>();

  filesInQueue: File[] = [];

  constructor(
    private fileReaderService: FileReaderService,
    private explorerRequestBuilderService: ExplorerRequestBuilderService,
    private explorerService: ExplorerService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.folders$ = combineLatest([
      this.route.params,
      this.refreshFolders$,
    ]).pipe(
      switchMap(([params, refresh]) =>
        this.explorerService.getFsObjects(`/${params['path']}`)
      ),
      tap((result: FileSystemObject[]) => (this.dataSource.data = result))
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  openFolder(fsElem: FileSystemObject): void {
    if (fsElem.type !== FileSystemObjectTypes.DIRECTORY) {
      return;
    }
    this.router.navigate([fsElem.fullPath], { relativeTo: this.route }).then();
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

  filesDroppedOnFolder(files: File[], folder: FileSystemObject): void {
    this.control.patchValue(files);
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
      } as CreateRenameDialogData,
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((str) => typeof str === 'string'),
        switchMap((folderName: string) =>
          this.explorerService.createFolder(
            folderName,
            `/${decodeURIComponent(this.route.snapshot.params['path'])}` || `/`
          )
        ),
        tap(() => {
          this.refreshFolders$.next(true);
        }),
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

  rename(row: FileSystemObject): void {
    const dialogRef = this.dialog.open(CreateRenameFolderDialogComponent, {
      data: {
        title: $localize`Rename folder`,
        inputLabel: $localize`New name`,
        defaultInputValue: row.fileName,
        submitButtonText: $localize`Rename`,
      } as CreateRenameDialogData,
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((str) => typeof str === 'string'),
        switchMap((newName: string) =>
          this.explorerService.renameFolder(newName, row.fullPath)
        ),
        tap(() => {
          this.refreshFolders$.next(true);
        }),
        take(1)
      )
      .subscribe();
  }

  move(row: FileSystemObject): void {
    const dialogRef = this.dialog.open(MoveFolderDialogComponent);

    dialogRef
      .afterClosed()
      .pipe(
        filter((v) => v !== undefined),
        switchMap((v: FileSystemObject) =>
          this.explorerService.moveFolder(row.fullPath, v.fullPath)
        ),
        take(1)
      )
      .subscribe();
  }
}
