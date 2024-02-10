import axios, { AxiosResponse, AxiosStatic } from 'axios';
import { QtisRequestResponse } from '../core/interfaces/qtis-req-res.interface';
import { DaoConfig } from '../core/config/DaoConfig';

export class DispatchService {
  private static instance: DispatchService | undefined = undefined;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static getInstance(): DispatchService {
    if (!DispatchService.instance) {
      DispatchService.instance = new DispatchService();
    }
    return DispatchService.instance;
  }

  async dispatch<Req, Res>(
    body: QtisRequestResponse<Req>,
    abortSignal: AbortSignal,
  ): Promise<AxiosResponse<QtisRequestResponse<Res>>> {
    const apiUrl = DaoConfig.getInstance().apiUrl;
    // When on localhost -> http://localhost:4201/api/dispatch
    // When on prod -> https://dev37.qxyz.ru/api/dispatch

    return await axios.post<
      QtisRequestResponse<Res>,
      AxiosResponse<QtisRequestResponse<Res>>,
      QtisRequestResponse<Req>
    >(apiUrl, body, {
      signal: abortSignal,
    });
  }

  getAxiosInstance(): AxiosStatic {
    return axios;
  }
}
