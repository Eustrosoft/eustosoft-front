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
  asapScheduler,
  asyncScheduler,
  BehaviorSubject,
  buffer,
  catchError,
  combineLatest,
  concatMap,
  concatMapTo,
  concatWith,
  delay,
  EMPTY,
  filter,
  finalize,
  first,
  from,
  last,
  map,
  mergeAll,
  mergeMap,
  Observable,
  of,
  pairwise,
  queueScheduler,
  scheduled,
  skipWhile,
  Subject,
  switchMap,
  take,
  takeUntil,
  takeWhile,
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
import {
  MatBottomSheet,
  MatBottomSheetConfig,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { FileLoadingProgressComponent } from './components/file-loading-progress/file-loading-progress.component';
import { QueueScheduler } from 'rxjs/internal/scheduler/QueueScheduler';

@Component({
  selector: 'eustrosoft-front-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerComponent implements OnInit, OnDestroy {
  @ViewChild(InputFileComponent) inputFileComponent!: InputFileComponent;
  upload$!: Observable<any>;
  result$!: Observable<any>;
  params$!: Observable<any>;
  test$!: Observable<any>;
  filesObs$!: Observable<
    { file: File; chunks: Blob[]; currentChunk: number }[]
  >;
  fileQueue$ = new Subject<File[]>();
  uploadInProcess$ = new BehaviorSubject<boolean>(false);
  bottomSheetRef!: MatBottomSheetRef<FileLoadingProgressComponent>;
  folders$!: Observable<FileSystemObject[]>;

  displayedColumns: string[] = ['select', 'name', 'lastModified', 'actions'];
  dataSource = new MatTableDataSource<FileSystemObject>([]);
  selection = new SelectionModel<FileSystemObject>(true, []);

  control = new FormControl<File[]>([], { nonNullable: true });
  progressBarValue$ = new BehaviorSubject<number>(0);
  currentFile$ = new BehaviorSubject<string>('');
  files$ = new BehaviorSubject<File[]>([]);

  fsObjTypes = FileSystemObjectTypes;

  private destroy$ = new Subject<void>();

  private bottomSheetConfig: MatBottomSheetConfig = {
    data: {
      files$: this.files$,
      progressBarValue$: this.progressBarValue$,
      currentFile$: this.currentFile$,
    },
    hasBackdrop: false,
    disableClose: true,
    panelClass: 'bottom-sheet-position',
  };

  filesInQueue: File[] = [];

  constructor(
    private fileReaderService: FileReaderService,
    private explorerRequestBuilderService: ExplorerRequestBuilderService,
    private explorerService: ExplorerService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private bottomSheet: MatBottomSheet
  ) {}

  ngOnInit(): void {
    this.params$ = this.route.params;
    this.folders$ = this.params$.pipe(
      switchMap((params: { path: string }) =>
        this.explorerService.getFsObjects(params.path)
      ),
      tap((result) => (this.dataSource.data = result))
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

  openFolder(folder: FileSystemObject): void {
    if (folder.children.length !== 0) {
      this.router.navigate([folder.title], { relativeTo: this.route });
    }
  }

  uploadFilesBase64(): void {
    if (this.control.value.length === 0) {
      this.snackBar.open('Select files first', 'Close');
      return;
    }
    let uploadError = false;
    const bottomSheetRef = this.bottomSheet.open(
      FileLoadingProgressComponent,
      this.bottomSheetConfig
    );
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
        bottomSheetRef.dismiss();
        return EMPTY;
      }),
      finalize(() => {
        if (!uploadError) {
          this.snackBar.open('Upload completed', 'Close');
          bottomSheetRef.dismiss();
          this.control.patchValue([]);
        }
      })
    );

    this.result$ = bottomSheetRef.afterDismissed().pipe(
      delay(200),
      tap(() => this.snackBar.open('Upload completed', 'Close'))
    );
  }

  uploadFilesBinary(): void {
    if (this.control.value.length === 0) {
      this.snackBar.open('Select files first', 'Close');
      return;
    }
    let uploadError = false;
    this.files$.next(this.control.value);
    const bottomSheetRef = this.bottomSheet.open(
      FileLoadingProgressComponent,
      this.bottomSheetConfig
    );
    this.upload$ = this.fileReaderService.splitBinary(this.control.value).pipe(
      tap(() => this.currentFile$.next('Upload starting ...')),
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
      tap((value) => {
        const file = value[0][1];
        this.files$.next(
          this.files$.getValue().filter((f) => f.name !== file.name)
        );
      }),
      catchError((err) => {
        uploadError = true;
        console.error(err);
        this.snackBar.open('Error making request', 'Close');
        bottomSheetRef.dismiss();
        return EMPTY;
      }),
      finalize(() => {
        if (!uploadError) {
          bottomSheetRef.dismiss();
          this.control.patchValue([]);
        }
      })
    );

    this.result$ = bottomSheetRef.afterDismissed().pipe(
      delay(200),
      tap(() => this.snackBar.open('Upload completed', 'Close'))
    );
  }

  filesDropped(files: File[]): void {
    this.control.patchValue(files);
  }

  filesDroppedOnFolder(files: File[], folder: FileSystemObject): void {
    this.control.patchValue(files);
    this.uploadFilesBinary();
  }

  deleteFile(index: number): void {
    this.control.value.splice(index, 1);
    this.control.patchValue(this.control.value);
  }

  back() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  /**
   * TODO
   * Разобраться как сделать очередь и работать с ней
   * Складывать файлы в очередь
   * Следить за состоянием
   * Управлять состоянием кокретного файла
   */

  patchQueue(): void {
    this.fileQueue$.next(this.control.value);
    this.uploadInProcess$.next(true);
    this.uploadFilesBinary();
  }
}
