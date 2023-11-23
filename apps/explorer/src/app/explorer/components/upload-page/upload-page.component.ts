/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { catchError, EMPTY, Observable, shareReplay, Subject, tap } from 'rxjs';
import { InputFileComponent, Option } from '@eustrosoft-front/common-ui';
import { UploadItemForm } from '@eustrosoft-front/core';
import { ExplorerUploadService } from '../../services/explorer-upload.service';
import { ExplorerUploadItemsService } from '../../services/explorer-upload-items.service';
import { ExplorerUploadItemFormFactoryService } from '../../services/explorer-upload-item-form-factory.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ExplorerDictionaryService } from '../../services/explorer-dictionary.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'eustrosoft-front-upload-page',
  templateUrl: './upload-page.component.html',
  styleUrls: ['./upload-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadPageComponent implements OnInit, OnDestroy {
  @ViewChild(InputFileComponent) inputFileComponent!: InputFileComponent;
  private snackBar = inject(MatSnackBar);
  private cdRef = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);
  private explorerUploadService = inject(ExplorerUploadService);
  private explorerDictionaryService = inject(ExplorerDictionaryService);
  private explorerUploadItemsService = inject(ExplorerUploadItemsService);
  private explorerUploadItemFormFactoryService = inject(
    ExplorerUploadItemFormFactoryService
  );

  private startUpload$ = new Subject<void>();
  private emitBuffer$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  fileControl = new FormControl<File[]>([], { nonNullable: true });
  uploadObjectForms = new FormArray<FormGroup<UploadItemForm>>([]);

  // fileControlValueChanges$: Observable<UploadObject[]> =
  //   this.fileControl.valueChanges.pipe(
  //     map((files) =>
  //       files.map<UploadObject>((file) => ({
  //         uploadItem: {
  //           file,
  //           progress: 0,
  //           state: UploadingState.PENDING,
  //           cancelled: false,
  //         },
  //       }))
  //     ),
  //     tap((uploadObjects) => {
  //       const forms = uploadObjects.map((uploadObject) =>
  //         this.explorerUploadItemFormFactoryService.makeNewUploadObjectForm(
  //           uploadObject
  //         )
  //       );
  //       forms.forEach((form) => this.uploadObjectForms.push(form));
  //       console.log('this.uploadObjectForms', this.uploadObjectForms);
  //     }),
  //     shareReplay(1)
  //   );
  //
  // upload$ = this.startUpload$.asObservable().pipe(
  //   switchMap(() => of(this.uploadObjectForms.getRawValue() as UploadObject[])),
  //   tap((awf) => {
  //     console.log('upload$', awf);
  //   }),
  //   switchMap((files) =>
  //     zip([
  //       of(files),
  //       this.explorerUploadItemsService.uploadObjects$.pipe(
  //         tap((objects) => {
  //           this.uploadObjectForms.patchValue(objects, { emitEvent: true });
  //           // this.cdRef.markForCheck();
  //         })
  //       ),
  //     ])
  //   ),
  //   switchMap(([objects, uploadObjects]) => {
  //     const uniqueArray = uploadObjects
  //       .concat(objects)
  //       .filter(
  //         (obj, index, self) =>
  //           index ===
  //           self.findIndex(
  //             (t) => t.uploadItem.file.name === obj.uploadItem.file.name
  //           )
  //       )
  //       .filter((obj) => !obj.uploadItem.cancelled);
  //     this.explorerUploadItemsService.uploadObjects$.next(uniqueArray);
  //     return of(uniqueArray);
  //   }),
  // switchMap((objects) => {
  //   switch (this.uploadTypeControl.value) {
  //     case 'binary':
  //       return this.explorerUploadService.uploadHexString(
  //         objects,
  //         '/LOCAL/RootYadzuka/My Movies'
  //       );
  //     case 'hex':
  //       return this.explorerUploadService.uploadHexString(
  //         objects,
  //         '/LOCAL/RootYadzuka/My Movies'
  //       );
  //     case 'base64':
  //       return this.explorerUploadService.uploadHexString(
  //         objects,
  //         '/LOCAL/RootYadzuka/My Movies'
  //       );
  //     default:
  //       return this.explorerUploadService.uploadHexString(
  //         objects,
  //         '/LOCAL/RootYadzuka/My Movies'
  //       );
  //   }
  // }),
  // emit buffer after every file upload completion
  //   tap(() => {
  //     this.emitBuffer$.next();
  //   }),
  //   catchError((err) => {
  //     console.error(err);
  //     return EMPTY;
  //   }),
  //   repeat()
  // );

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

  securityLevelOptions$: Observable<Option[]> = this.explorerDictionaryService
    .getSecurityLevelOptions()
    .pipe(
      shareReplay(1),
      catchError((err: HttpErrorResponse) => {
        this.snackBar.open(
          this.translateService.instant(
            'EXPLORER.ERRORS.SECURITY_LEVEL_OPTIONS_FETCH_ERROR'
          ),
          'close'
        );
        return EMPTY;
      })
    );

  ngOnInit(): void {
    console.log('init');
    this.uploadObjectForms.valueChanges
      .pipe(
        tap((val) => {
          console.log('Form Change', val);
        })
      )
      .subscribe();
    // this.upload$ = this.startUpload$.asObservable().pipe(
    //   switchMap(() => this.objectsToUpload$.pipe(tap(console.log)))
    // buffer(this.emitBuffer$.pipe(takeUntil(this.destroy$))),
    // mergeMap((files: File[][]) => files),
    // map((files: File[]) => {
    //   console.log('Buffer', files);
    //   const uploadItems = files.map<UploadItem>((file) => ({
    //     file,
    //     progress: 0,
    //     state: UploadingState.PENDING,
    //     cancelled: false,
    //   }));
    //   return uploadItems;
    // }),
    // switchMap((files) =>
    //   zip([of(files), this.explorerUploadItemsService.uploadItems$])
    // ),
    // switchMap(([items, uploadItems]) => {
    //   const uniqueArray = uploadItems
    //     .concat(items)
    //     .filter(
    //       (obj, index, self) =>
    //         index === self.findIndex((t) => t.file.name === obj.file.name)
    //     )
    //     .filter((item: UploadItem) => !item.cancelled);
    //   this.explorerUploadItemsService.uploadItems$.next(uniqueArray);
    //   return of(uniqueArray);
    // }),
    // switchMap((items) => {
    //   switch (this.uploadTypeControl.value) {
    //     case 'binary':
    //       return this.explorerUploadService.uploadBinary(items, '/');
    //     case 'hex':
    //       return this.explorerUploadService.uploadHexString(items, '/');
    //     case 'base64':
    //       return this.explorerUploadService.uploadBase64(items, '/');
    //     default:
    //       return this.explorerUploadService.uploadBinary(items, '/');
    //   }
    // }),
    // // emit buffer after every file upload completion
    // tap(() => {
    //   this.emitBuffer$.next();
    // }),
    // catchError((err) => {
    //   console.error(err);
    //   return EMPTY;
    // }),
    // repeat()
    // );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  start(): void {
    this.startUpload$.next();
  }

  deleteFile(index: number) {
    this.uploadObjectForms.removeAt(index);
  }

  cancelFileUpload(index: number) {
    this.uploadObjectForms.removeAt(index);
  }
}
