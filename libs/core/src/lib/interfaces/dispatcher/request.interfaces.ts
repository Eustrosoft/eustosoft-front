/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export interface TisResponse {
  qtisver: number;
  responses: TisResponseBody[];
  qtisend: boolean;
}

export interface TisRequest {
  qtisver: number;
  requests: Array<FileRequest | ChunkedFileRequest>;
  qtisend: boolean;
}

export interface TisResponseBody {
  subsystem: string;
  status: number;
  qid: number;
  err_code: number;
  err_msg: string;
  result: TisTableResult[];
}

export interface TisTableResult {
  columns: string[];
  data_types: string[];
  rows: Array<Array<any>>;
  rows_count: number;
}

/**
 * DEPRECATED
 */
// export interface SqlRequest {
//   subsystem: string;
//   request: string;
//   parameters: {
//     method: string;
//     query: string;
//   };
// }

/**
 * DEPRECATED
 */
interface FileRequest {
  subsystem: string;
  request: string;
  parameters: {
    method: string;
    file: string;
    name: string;
    ext: string;
  };
}

export interface ChunkedFileRequest {
  subsystem: string;
  request: string;
  parameters: {
    method: string;
    data: {
      file: string;
      name: string;
      ext: string;
      chunk: number;
      all_chunks: number;
    };
  };
}
