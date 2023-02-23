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
import { CreateFolderDialogComponent } from './components/create-folder-dialog/create-folder-dialog.component';

@Component({
  selector: 'eustrosoft-front-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerComponent implements OnInit, OnDestroy {
  @ViewChild(InputFileComponent) inputFileComponent!: InputFileComponent;
  upload$!: Observable<any>;
  params$!: Observable<any>;

  folders$!: Observable<FileSystemObject[]>;

  displayedColumns: string[] = ['select', 'name', 'lastModified', 'actions'];
  dataSource = new MatTableDataSource<FileSystemObject>([]);
  selection = new SelectionModel<FileSystemObject>(true, []);

  control = new FormControl<File[]>([], { nonNullable: true });
  progressBarValue$ = new BehaviorSubject<number>(0);
  currentFile$ = new BehaviorSubject<string>('');

  fsObjTypes = FileSystemObjectTypes;

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
    this.params$ = this.route.params;
    this.folders$ = this.params$.pipe(
      switchMap((params: { path: string }) =>
        this.explorerService.getFsObjects(params.path)
      ),
      tap((result) => (this.dataSource.data = result))
    );
    let uploadError = false;
    this.upload$ = this.control.valueChanges.pipe(
      buffer(this.emitBuffer$.pipe(takeUntil(this.destroy$))),
      mergeMap((files: File[][]) => from(files)),
      tap((files: File[]) => {
        console.log('BUFFER EMITTED: ', files);
        if (files.length === 0 && !uploadError) {
          this.cd.markForCheck();
          this.snackBar.open('Upload completed', 'Close');
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
            this.snackBar.open('Error making request', 'Close');
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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  openFolder(fsElem: FileSystemObject): void {
    this.router.navigate([fsElem.fullPath], { relativeTo: this.route }).then();
  }

  uploadFilesBase64(): void {
    if (this.control.value.length === 0) {
      this.snackBar.open('Select files first', 'Close');
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
        this.snackBar.open('Error making request', 'Close');

        return EMPTY;
      }),
      finalize(() => {
        if (!uploadError) {
          this.snackBar.open('Upload completed', 'Close');

          this.control.patchValue([]);
        }
      })
    );
  }

  uploadFilesBinary(): void {
    if (this.control.value.length === 0) {
      this.snackBar.open('Select files first', 'Close');
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

  back() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  startUpload(): void {
    this.uploadFilesBinary();
  }

  createFolder(): void {
    const dialogRef = this.dialog.open(CreateFolderDialogComponent);

    dialogRef
      .afterClosed()
      .pipe(
        filter((str) => typeof str === 'string'),
        switchMap((folderName) =>
          this.explorerService.createFolder(folderName)
        ),
        tap((folder) => {
          console.log('The dialog was closed');
        }),
        take(1)
      )
      .subscribe();
  }

  download(index: number): void {
    const row = this.dataSource.data.find(
      (s, i) => index === i
    ) as FileSystemObject;
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
