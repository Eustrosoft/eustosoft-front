import { Injectable } from '@angular/core';
import {
  combineLatest,
  concatMap,
  from,
  mergeMap,
  Observable,
  of,
  Subscriber,
  toArray,
} from 'rxjs';

@Injectable()
export class FileReaderService {
  // 1048576 - 1 MB
  // 5242880 - 5 MB
  // 10485760 - 10 MB
  // 26214400 - 25 MB
  // 52428800 - 50 MB
  // 104857600 - 100 MB
  splitBase64(
    files: File[],
    chunkSize: number = 1048576
  ): Observable<{ file: File; chunks: string[] }> {
    return from(files).pipe(
      mergeMap((file: File) => {
        const buffer = this.blobToArrayBuffer(file);
        return combineLatest([of(file), buffer]).pipe(
          mergeMap(([file, buff]) => {
            let startPointer = 0;
            const endPointer = buff.byteLength;
            let chunks = [];
            while (startPointer < endPointer) {
              const newStartPointer = startPointer + chunkSize;
              chunks.push(buff.slice(startPointer, newStartPointer));
              startPointer = newStartPointer;
            }
            // Super slow
            chunks = chunks.map((chunk) =>
              window.btoa(
                new Uint8Array(chunk).reduce(
                  (data, byte) => data + String.fromCharCode(byte),
                  ''
                )
              )
            );
            return of({ file: file, chunks: chunks });
          })
        );
      })
    );
  }

  splitBinary(
    files: File[],
    chunkSize: number = 1048576
  ): Observable<{ file: File; chunks: Blob[] }> {
    return from(files).pipe(
      concatMap((file: File) => {
        const buffer = this.blobToArrayBuffer(file);
        return combineLatest([of(file), buffer]).pipe(
          mergeMap(([file, buff]) => {
            let startPointer = 0;
            const endPointer = buff.byteLength;
            const chunks = [];
            while (startPointer < endPointer) {
              const newStartPointer = startPointer + chunkSize;
              const chunk = buff.slice(startPointer, newStartPointer);
              chunks.push(new Blob([chunk]));
              startPointer = newStartPointer;
            }
            return of({ file: file, chunks: chunks });
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
