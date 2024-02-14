/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { RequestFactory } from '../core/interfaces/request-factory.interface';
import { FsViewResponse } from '../core/interfaces/fs/fs-view-response.interface';
import { requestFactoryFunction } from '../utils/request-factory.function';
import { FsViewRequest } from '../core/interfaces/fs/fs-view-request.interface';
import { SubsystemsEnum } from '../constants/enums/subsystems.enum';
import { FsActionsEnum } from '../constants/enums/fs-actions.enum';
import { SupportedLanguagesEnum } from '../constants/enums/supported-languages.enum';
import { DispatchService } from '../services/DispatchService';
import { FsUploadHexRequest } from '../core/interfaces/fs/fs-upload-hex-request.interface';
import { QtisRequestResponse } from '../core/interfaces/qtis-req-res.interface';
import { crc32 } from '../utils/crc32.function';
import { FsUploadItem } from '../core/interfaces/fs/fs-upload-item.interface';
import { bytesToHexString } from '../utils/bytes-to-hex.function';
import { FsUploadHexResponse } from '../core/interfaces/fs/fs-upload-hex-response.interface';

export class Fs {
  private dispatchService: DispatchService;

  constructor(
    dispatchService: DispatchService = DispatchService.getInstance(),
  ) {
    this.dispatchService = dispatchService;
  }

  listFs(path: string = '/'): RequestFactory<FsViewResponse> {
    return requestFactoryFunction<FsViewRequest, FsViewResponse>({
      r: [
        {
          s: SubsystemsEnum.CMS,
          r: FsActionsEnum.VIEW,
          l: SupportedLanguagesEnum.EN_US,
          path,
        },
      ],
      t: 0,
    });
  }

  // TODO класса FileReader нет в NodeJS
  //  Нужно подменять реализацию в зависимости от окружения (browser или node) соответственно
  async uploadFiles(
    fsUploadItems: FsUploadItem[],
    path = '/',
    chunkSize = 1,
  ): Promise<RequestFactory<FsUploadHexResponse>[]> {
    const chunkByteSize = chunkSize * 1024 * 1024;
    const factories: RequestFactory<FsUploadHexResponse>[] = [];
    for (let i = 0; i < fsUploadItems.length; i++) {
      const { file, filename, securityLevel, description } = fsUploadItems[i];
      const totalChunks = Math.ceil(file.size / chunkByteSize);

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkByteSize;
        const end = Math.min(start + chunkByteSize, file.size);
        const chunk = file.slice(start, end);

        const hexString = await this.getHexString(chunk);

        const params: FsUploadHexRequest['parameters'] = {
          hexString,
          name: filename ?? file.name,
          ext: file.name.split('.').pop() as string,
          chunk: chunkIndex,
          all_chunks: totalChunks,
          hash: crc32(hexString),
          path,
        };
        if (securityLevel !== undefined) {
          params.securityLevel = +securityLevel;
        }
        if (description !== undefined) {
          params.description = description;
        }
        const request = this.buildChunkUploadRequest(params);

        factories.push(
          requestFactoryFunction<FsUploadHexRequest, FsUploadHexResponse>(
            request,
          ),
        );
      }
    }
    return factories;
  }

  private getHexString(fileChunk: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        const arrayBuffer = event.target!.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        const hexString = bytesToHexString(uint8Array);
        resolve(hexString);
      };
      reader.onerror = function (error) {
        reject(error);
      };
      reader.readAsArrayBuffer(fileChunk);
    });
  }

  private buildChunkUploadRequest(
    parameters: FsUploadHexRequest['parameters'],
  ): QtisRequestResponse<FsUploadHexRequest> {
    return {
      r: [
        {
          s: SubsystemsEnum.FILE,
          r: FsActionsEnum.UPLOAD_CHUNKS_HEX,
          l: SupportedLanguagesEnum.EN_US,
          parameters,
        },
      ],
      t: 0,
    };
  }
}
