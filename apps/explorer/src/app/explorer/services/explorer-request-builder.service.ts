/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import {
  CmsRequestActions,
  crc32,
  CreateRequest,
  DeleteRequest,
  DownloadTicketRequest,
  MoveCopyRequest,
  MoveRequest,
  QtisRequestResponseInterface,
  Subsystems,
  SupportedLanguages,
  UploadHexRequest,
  UploadRequest,
  ViewRequest,
} from '@eustrosoft-front/core';
import { Observable, of } from 'rxjs';
import { FileSystemObject } from '../models/file-system-object.interface';

@Injectable()
export class ExplorerRequestBuilderService {
  buildBinaryChunkRequest(
    file: File,
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    uint8Array: Uint8Array,
    path: string = '/'
  ): QtisRequestResponseInterface<UploadRequest> {
    return {
      r: [
        {
          s: Subsystems.FILE,
          r: CmsRequestActions.UPLOAD_CHUNKS_BINARY,
          l: SupportedLanguages.EN_US,
          parameters: {
            file: '',
            name: file.name,
            ext: file.name.split('.').pop() as string,
            chunk: chunkIndex,
            all_chunks: totalChunks,
            hash: crc32(uint8Array),
            path,
          },
        },
      ],
      t: 0,
    };
  }

  buildBase64ChunkRequest(
    file: File,
    chunk: string,
    chunkIndex: number,
    totalChunks: number,
    path: string = '/'
  ): QtisRequestResponseInterface<UploadRequest> {
    return {
      r: [
        {
          s: Subsystems.FILE,
          r: CmsRequestActions.UPLOAD_CHUNKS_BASE64,
          l: SupportedLanguages.EN_US,
          parameters: {
            file: chunk,
            name: file.name,
            ext: file.name.split('.').pop() as string,
            chunk: chunkIndex,
            all_chunks: totalChunks,
            hash: '',
            path,
          },
        },
      ],
      t: 0,
    };
  }

  buildHexChunkRequest(
    file: File,
    chunk: string,
    chunkIndex: number,
    totalChunks: number,
    securityLevel?: string,
    description?: string,
    path: string = '/'
  ): QtisRequestResponseInterface<UploadHexRequest> {
    const params: UploadHexRequest['parameters'] = {
      hexString: chunk,
      name: file.name,
      ext: file.name.split('.').pop() as string,
      chunk: chunkIndex,
      all_chunks: totalChunks,
      hash: crc32(chunk),
      path,
    };
    if (securityLevel !== undefined) {
      params.securityLevel = +securityLevel;
    }

    if (description !== undefined) {
      params.description = description;
    }
    return {
      r: [
        {
          s: Subsystems.FILE,
          r: CmsRequestActions.UPLOAD_CHUNKS_HEX,
          l: SupportedLanguages.EN_US,
          parameters: params,
        },
      ],
      t: 0,
    };
  }

  buildMoveRequest(
    from: FileSystemObject[],
    to: string[],
    description: string | undefined = undefined,
    action: CmsRequestActions = CmsRequestActions.MOVE
  ): Observable<QtisRequestResponseInterface<MoveRequest>> {
    switch (action) {
      case CmsRequestActions.RENAME: {
        return of({
          r: [
            {
              s: Subsystems.CMS,
              r: CmsRequestActions.MOVE,
              l: SupportedLanguages.EN_US,
              to: to[0],
              description: description,
            } as MoveRequest,
          ],
          t: 0,
        });
      }
      case CmsRequestActions.MOVE:
      default: {
        return of({
          r: from.map(
            (obj: FileSystemObject, i: number) =>
              ({
                s: Subsystems.CMS,
                r: action,
                l: SupportedLanguages.EN_US,
                from: obj.fullPath,
                to: to[i],
                description: description,
              } as MoveRequest)
          ),
          t: 0,
        });
      }
    }
  }

  buildMoveCopyRequest(
    from: FileSystemObject[],
    to: string[],
    action: CmsRequestActions
  ): Observable<QtisRequestResponseInterface<MoveCopyRequest>> {
    return of({
      r: from.map(
        (obj: FileSystemObject, i: number) =>
          ({
            s: Subsystems.CMS,
            r: action,
            l: SupportedLanguages.EN_US,
            from: obj.fullPath,
            to: to[i],
          } as MoveCopyRequest)
      ),
      t: 0,
    });
  }

  buildViewRequest(
    path: string
  ): Observable<QtisRequestResponseInterface<ViewRequest>> {
    return of({
      r: [
        {
          s: Subsystems.CMS,
          r: CmsRequestActions.VIEW,
          l: SupportedLanguages.EN_US,
          path: path,
        },
      ],
      t: 0,
    });
  }

  buildCreateRequest(
    params: Omit<CreateRequest, 's' | 'l' | 'r'>
  ): Observable<QtisRequestResponseInterface<CreateRequest>> {
    return of({
      r: [
        {
          s: Subsystems.CMS,
          r: CmsRequestActions.CREATE,
          l: SupportedLanguages.EN_US,
          ...params,
        },
      ],
      t: 0,
    });
  }

  buildDeleteRequests(
    rows: FileSystemObject[]
  ): Observable<QtisRequestResponseInterface<DeleteRequest>> {
    return of({
      r: rows.map(
        (row: FileSystemObject) =>
          ({
            s: Subsystems.CMS,
            r: CmsRequestActions.DELETE,
            l: SupportedLanguages.EN_US,
            path: row.fullPath,
          } as DeleteRequest)
      ),
      t: 0,
    });
  }

  buildDownloadTicketRequests(
    rows: FileSystemObject[]
  ): Observable<QtisRequestResponseInterface<DownloadTicketRequest>> {
    return of({
      r: rows.map(
        (row: FileSystemObject) =>
          ({
            s: Subsystems.CMS,
            r: CmsRequestActions.TICKET,
            l: SupportedLanguages.EN_US,
            path: row.fullPath,
          } as DownloadTicketRequest)
      ),
      t: 0,
    });
  }
}
