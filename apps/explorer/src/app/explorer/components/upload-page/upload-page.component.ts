/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { map, mergeMap, Observable, scan, Subject, tap } from 'rxjs';
import { InputFileComponent, Option } from '@eustrosoft-front/common-ui';
import { UploadObject, UploadObjectForm } from '@eustrosoft-front/core';
import { ExplorerUploadService } from '../../services/explorer-upload.service';
import { ExplorerUploadItemsService } from '../../services/explorer-upload-items.service';
import { UploadingState } from '../../constants/enums/uploading-state.enum';
import { ExplorerUploadItemFormFactoryService } from '../../services/explorer-upload-item-form-factory.service';

@Component({
  selector: 'eustrosoft-front-upload-page',
  templateUrl: './upload-page.component.html',
  styleUrls: ['./upload-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadPageComponent implements OnInit, OnDestroy {
  @ViewChild(InputFileComponent) inputFileComponent!: InputFileComponent;

  upload$!: Observable<any>;
  fileControlValueChanges$!: Observable<UploadObject[]>;
  objectsToUpload$!: Observable<UploadObject[]>;
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
  uploadObjects = new FormArray<FormGroup<UploadObjectForm>>([]);

  private startUpload$ = new Subject<void>();
  private emitBuffer$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  private explorerUploadService: ExplorerUploadService = inject(
    ExplorerUploadService
  );
  private explorerUploadItemsService: ExplorerUploadItemsService = inject(
    ExplorerUploadItemsService
  );
  private explorerUploadItemFormFactoryService: ExplorerUploadItemFormFactoryService =
    inject(ExplorerUploadItemFormFactoryService);

  ngOnInit(): void {
    this.fileControlValueChanges$ = this.fileControl.valueChanges.pipe(
      map((files) =>
        files.map<UploadObject>((file) => ({
          uploadItem: {
            file,
            progress: 0,
            state: UploadingState.PENDING,
            cancelled: false,
          },
          note: '',
          accessLevel: 0,
        }))
      ),
      tap((uploadObjects) => {
        const forms = uploadObjects.map((uploadObject) =>
          this.explorerUploadItemFormFactoryService.makeNewUploadObjectForm(
            uploadObject
          )
        );
        forms.forEach((form) => this.uploadObjects.push(form));
        console.log(this.uploadObjects);
      })
    );

    this.objectsToUpload$ = this.fileControlValueChanges$.pipe(
      mergeMap((objects) => objects),
      scan<UploadObject, UploadObject[]>((acc, obj) => [...acc, obj], [])
    );

    // this.upload$ = this.fileControl.valueChanges.pipe(
    //   buffer(this.emitBuffer$.pipe(takeUntil(this.destroy$))),
    //   mergeMap((files: File[][]) => files),
    //   map((files: File[]) => {
    //     console.log('Buffer', files);
    //     const uploadItems = files.map<UploadItem>((file) => ({
    //       file,
    //       progress: 0,
    //       state: UploadingState.PENDING,
    //       cancelled: false,
    //     }));
    //     return uploadItems;
    //   }),
    //   switchMap((files) =>
    //     zip([of(files), this.explorerUploadItemsService.uploadItems$])
    //   ),
    //   switchMap(([items, uploadItems]) => {
    //     const uniqueArray = uploadItems
    //       .concat(items)
    //       .filter(
    //         (obj, index, self) =>
    //           index === self.findIndex((t) => t.file.name === obj.file.name)
    //       )
    //       .filter((item: UploadItem) => !item.cancelled);
    //     this.explorerUploadItemsService.uploadItems$.next(uniqueArray);
    //     return of(uniqueArray);
    //   }),
    //   switchMap((items) => {
    //     switch (this.uploadTypeControl.value) {
    //       case 'binary':
    //         return this.explorerUploadService.uploadBinary(items, '/');
    //       case 'hex':
    //         return this.explorerUploadService.uploadHexString(items, '/');
    //       case 'base64':
    //         return this.explorerUploadService.uploadBase64(items, '/');
    //       default:
    //         return this.explorerUploadService.uploadBinary(items, '/');
    //     }
    //   }),
    //   // emit buffer after every file upload completion
    //   tap(() => {
    //     this.emitBuffer$.next();
    //   }),
    //   catchError((err) => {
    //     console.error(err);
    //     return EMPTY;
    //   }),
    //   repeat()
    // );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  start(): void {
    this.startUpload$.next();
  }
}
