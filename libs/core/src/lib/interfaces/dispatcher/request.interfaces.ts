export interface TisResponse {
  qtisver: number;
  responses: TisResponseBody[];
  qtisend: boolean;
}

export interface TisRequest {
  qtisver: number;
  requests: Array<SqlRequest | FileRequest | ChunkedFileRequest>;
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

export interface SqlRequest {
  subsystem: string;
  request: string;
  parameters: {
    method: string;
    query: string;
  };
}

export interface FileRequest {
  subsystem: string;
  request: string;
  parameters: {
    method: string;
    data: {
      file: string;
      name: string;
      ext: string;
    };
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
