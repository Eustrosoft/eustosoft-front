/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import {
  crc32,
  QtisRequestResponse,
  Subsystems,
  SupportedLanguages,
} from '@eustrosoft-front/core';
import { Observable, of } from 'rxjs';
import {
  CreateRequest,
  DeleteRequest,
  DownloadTicketRequest,
  MoveCopyRequest,
  MoveRequest,
  UploadHexRequest,
  UploadRequest,
  ViewRequest,
} from '../interfaces/explorer-request.interface';
import { ExplorerRequestActions } from '../constants/enums/explorer-actions.enum';
import { FileSystemObject } from '../interfaces/file-system-object.interface';

@Injectable({ providedIn: 'root' })
export class ExplorerRequestBuilderService {
  buildBinaryChunkRequest(
    file: File,
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    uint8Array: Uint8Array,
    path: string = '/',
  ): QtisRequestResponse<UploadRequest> {
    return {
      r: [
        {
          s: Subsystems.FILE,
          r: ExplorerRequestActions.UPLOAD_CHUNKS_BINARY,
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
    path: string = '/',
  ): QtisRequestResponse<UploadRequest> {
    return {
      r: [
        {
          s: Subsystems.FILE,
          r: ExplorerRequestActions.UPLOAD_CHUNKS_BASE64,
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
    filename: string,
    chunk: string,
    chunkIndex: number,
    totalChunks: number,
    securityLevel?: string,
    description?: string,
    path: string = '/',
  ): QtisRequestResponse<UploadHexRequest> {
    const params: UploadHexRequest['parameters'] = {
      hexString: chunk,
      name: filename ?? file.name,
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
          r: ExplorerRequestActions.UPLOAD_CHUNKS_HEX,
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
    action: ExplorerRequestActions = ExplorerRequestActions.MOVE,
  ): Observable<QtisRequestResponse<MoveRequest>> {
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
          }) as MoveRequest,
      ),
      t: 0,
    });
  }

  buildMoveCopyRequest(
    from: FileSystemObject[],
    to: string[],
    action: ExplorerRequestActions,
  ): Observable<QtisRequestResponse<MoveCopyRequest>> {
    return of({
      r: from.map(
        (obj: FileSystemObject, i: number) =>
          ({
            s: Subsystems.CMS,
            r: action,
            l: SupportedLanguages.EN_US,
            from: obj.fullPath,
            to: to[i],
          }) as MoveCopyRequest,
      ),
      t: 0,
    });
  }

  buildViewRequest(path: string): Observable<QtisRequestResponse<ViewRequest>> {
    return of({
      r: [
        {
          s: Subsystems.CMS,
          r: ExplorerRequestActions.VIEW,
          l: SupportedLanguages.EN_US,
          path: path,
        },
      ],
      t: 0,
    });
  }

  buildCreateRequest(
    params: Omit<CreateRequest, 's' | 'l' | 'r'>,
  ): Observable<QtisRequestResponse<CreateRequest>> {
    return of({
      r: [
        {
          s: Subsystems.CMS,
          r: ExplorerRequestActions.CREATE,
          l: SupportedLanguages.EN_US,
          ...params,
        },
      ],
      t: 0,
    });
  }

  buildDeleteRequests(
    rows: FileSystemObject[],
  ): Observable<QtisRequestResponse<DeleteRequest>> {
    return of({
      r: rows.map(
        (row: FileSystemObject) =>
          ({
            s: Subsystems.CMS,
            r: ExplorerRequestActions.DELETE,
            l: SupportedLanguages.EN_US,
            path: row.fullPath,
          }) as DeleteRequest,
      ),
      t: 0,
    });
  }

  buildDownloadTicketRequests(
    rows: FileSystemObject[],
  ): Observable<QtisRequestResponse<DownloadTicketRequest>> {
    return of({
      r: rows.map(
        (row: FileSystemObject) =>
          ({
            s: Subsystems.CMS,
            r: ExplorerRequestActions.TICKET,
            l: SupportedLanguages.EN_US,
            path: row.fullPath,
          }) as DownloadTicketRequest,
      ),
      t: 0,
    });
  }
}
