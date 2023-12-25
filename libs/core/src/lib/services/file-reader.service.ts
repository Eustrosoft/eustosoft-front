/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import {
  combineLatest,
  concatMap,
  mergeMap,
  Observable,
  of,
  Subscriber,
  switchMap,
} from 'rxjs';
import { UploadItem } from '../interfaces/cms/upload-item.interface';

@Injectable()
export class FileReaderService {
  // 1048576 - 1 MB
  // 5242880 - 5 MB
  // 10485760 - 10 MB
  // 26214400 - 25 MB
  // 52428800 - 50 MB
  // 104857600 - 100 MB

  splitOneBase64(
    item: UploadItem,
    chunkSize: number = 1048576
  ): Observable<
    UploadItem & {
      chunks: string[];
    }
  > {
    return of(item).pipe(
      concatMap((item) => {
        const buffer = this.blobToArrayBuffer(item.file);
        return combineLatest([of(item), buffer]).pipe(
          mergeMap(([item, buff]) => {
            let startPointer = 0;
            const endPointer = buff.byteLength;
            const chunks = [];
            while (startPointer < endPointer) {
              const newStartPointer = startPointer + chunkSize;
              const chunk = buff.slice(startPointer, newStartPointer);
              let binary = '';
              const bytes = new Uint8Array(chunk);
              const len = bytes.byteLength;
              for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const base64Chunk = window.btoa(binary);
              chunks.push(base64Chunk);
              startPointer = newStartPointer;
            }
            return of({ ...item, chunks: chunks });
          })
        );
      })
    );
  }

  splitOneBinary(
    item: UploadItem,
    chunkSize: number = 1048576
  ): Observable<
    UploadItem & {
      chunks: Blob[];
    }
  > {
    return of(item).pipe(
      concatMap((item) => {
        const buffer = this.blobToArrayBuffer(item.file);
        return combineLatest([of(item), buffer]).pipe(
          mergeMap(([item, buff]) => {
            let startPointer = 0;
            const endPointer = buff.byteLength;
            const chunks = [];
            while (startPointer < endPointer) {
              const newStartPointer = startPointer + chunkSize;
              const chunk = buff.slice(startPointer, newStartPointer);
              chunks.push(new Blob([chunk]));
              startPointer = newStartPointer;
            }
            return of({ ...item, chunks: chunks });
          })
        );
      })
    );
  }

  splitOneToHexString(
    item: UploadItem,
    chunkSize: number = 1048576
  ): Observable<
    UploadItem & {
      chunks: string[];
    }
  > {
    return of(item).pipe(
      concatMap((item) => {
        const buffer = this.blobToArrayBuffer(item.file);
        return combineLatest([of(item), buffer]).pipe(
          switchMap(([item, buffer]) => {
            let startPointer = 0;
            const endPointer = buffer.byteLength;
            const chunks: string[] = [];
            while (startPointer < endPointer) {
              const newStartPointer = startPointer + chunkSize;
              const chunk = buffer.slice(startPointer, newStartPointer);

              // TODO executes ~ 150 ms with 5MB file => move to web worker
              let byteaStr = '';
              const h = '0123456789ABCDEF';
              new Uint8Array(chunk).forEach((v) => {
                byteaStr += h[v >> 4] + h[v & 15];
              });

              chunks.push(byteaStr);
              startPointer = newStartPointer;
            }
            return of({ ...item, chunks: chunks });
          })
        );
      })
    );
  }

  blobToArrayBuffer(blob: Blob | File): Observable<ArrayBuffer> {
    return new Observable((obs: Subscriber<ArrayBuffer>) => {
      if (!(blob instanceof Blob)) {
        obs.error(new Error('`blob` must be an instance of File or Blob.'));
        return;
      }

      const reader = new FileReader();

      reader.onerror = (err) => obs.error(err);
      reader.onabort = (err) => obs.error(err);
      reader.onload = () => obs.next(reader.result as ArrayBuffer);
      reader.onloadend = () => obs.complete();

      return reader.readAsArrayBuffer(blob);
    });
  }

  blobToUint8Array(blob: Blob | File): Observable<Uint8Array> {
    return new Observable((obs: Subscriber<Uint8Array>) => {
      if (!(blob instanceof Blob)) {
        obs.error(new Error('`blob` must be an instance of File or Blob.'));
        return;
      }

      const reader = new FileReader();

      reader.onerror = (err) => obs.error(err);
      reader.onabort = (err) => obs.error(err);
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        return obs.next(uint8Array);
      };
      reader.onloadend = () => obs.complete();

      return reader.readAsArrayBuffer(blob);
    });
  }

  blobToBase64(blob: Blob | File): Observable<string | ArrayBuffer | null> {
    return new Observable((obs: Subscriber<string | ArrayBuffer | null>) => {
      if (!(blob instanceof Blob)) {
        obs.error(new Error('`blob` must be an instance of File or Blob.'));
        return;
      }

      const reader = new FileReader();

      reader.onerror = (err) => obs.error(err);
      reader.onabort = (err) => obs.error(err);
      reader.onload = () =>
        obs.next(reader.result?.toString().replace(/^.*,/, ''));
      reader.onloadend = () => obs.complete();

      return reader.readAsDataURL(blob);
    });
  }
}
