import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { InputFileComponent } from '@eustrosoft-front/common-ui';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  delay,
  EMPTY,
  finalize,
  from,
  mergeMap,
  Observable,
  of,
  switchMap,
  tap,
  zip,
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

@Component({
  selector: 'eustrosoft-front-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerComponent implements OnInit {
  @ViewChild(InputFileComponent) inputFileComponent!: InputFileComponent;
  upload$!: Observable<any>;
  result$!: Observable<any>;
  params$!: Observable<any>;
  folders!: Observable<FileSystemObject[]>;

  displayedColumns: string[] = ['select', 'name', 'lastModified', 'actions'];
  dataSource = new MatTableDataSource<FileSystemObject>([]);
  selection = new SelectionModel<FileSystemObject>(true, []);

  control = new FormControl<File[]>([], { nonNullable: true });
  progressBarValue = new BehaviorSubject<number>(0);
  currentFile = new BehaviorSubject<string>('');

  fsObjTypes = FileSystemObjectTypes;

  private bottomSheetConfig: MatBottomSheetConfig = {
    data: {
      progressBarValue: this.progressBarValue,
      currentFile: this.currentFile,
    },
    hasBackdrop: false,
    disableClose: true,
    panelClass: 'bottom-sheet-position',
  };

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
    this.folders = this.params$.pipe(
      switchMap((params: { path: string }) =>
        this.explorerService.getFsObjects(params.path)
      ),
      tap((result) => (this.dataSource.data = result))
    );
    // this.router.events.forEach((event) => {
    //   if (event instanceof NavigationStart) {
    //     if (event.navigationTrigger === 'popstate') {
    //       /* Do something here */
    //     }
    //   }
    // });
    this.router.events.pipe().subscribe({
      next: (event) => {
        if (event instanceof NavigationStart) {
          if (event.navigationTrigger === 'popstate') {
            this.router.navigate([event.url]);
          }
        }
      },
    });
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
    let bottomSheetRef: MatBottomSheetRef<FileLoadingProgressComponent>;
    this.upload$ = this.fileReaderService.splitBase64(this.control.value).pipe(
      mergeMap((fc: { file: File; chunks: string[] }) =>
        this.explorerRequestBuilderService.buildChunkRequest(fc).pipe()
      ),
      tap((request: TisRequest) => {
        console.log(request);
        bottomSheetRef = this.bottomSheet.open(
          FileLoadingProgressComponent,
          this.bottomSheetConfig
        );
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
          this.currentFile.next(req.parameters.data.name);
          this.progressBarValue.next(
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
          this.inputFileComponent.patchInput();
          this.cd.markForCheck();
        }
      })
    );
  }

  uploadFilesBinary(): void {
    if (this.control.value.length === 0) {
      this.snackBar.open('Select files first', 'Close');
      return;
    }
    let uploadError = false;
    const bottomSheetRef = this.bottomSheet.open(
      FileLoadingProgressComponent,
      this.bottomSheetConfig
    );
    this.upload$ = this.fileReaderService.splitBinary(this.control.value).pipe(
      tap(() => this.currentFile.next('Upload starting ...')),
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
          })
        );
      }),
      tap(([response, file, chunks, currentChunk]) => {
        this.currentFile.next(file.name);
        this.progressBarValue.next(100 * ((currentChunk + 1) / chunks.length));
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
          this.inputFileComponent.patchInput();
          this.cd.markForCheck();
        }
      })
    );

    this.result$ = zip(this.upload$, bottomSheetRef.afterDismissed()).pipe(
      delay(200),
      tap(() => this.snackBar.open('Upload completed', 'Close'))
    );
  }

  filesDropped(files: File[]): void {
    this.control.patchValue(files);
    this.inputFileComponent.patchInput();
  }

  deleteFile(index: number): void {
    this.control.value.splice(index, 1);
    this.control.patchValue(this.control.value);
    this.inputFileComponent.patchInput();
  }

  back() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
