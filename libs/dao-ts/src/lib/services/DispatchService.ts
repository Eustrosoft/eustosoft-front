import axios, { AxiosResponse } from 'axios';
import { QtisRequestResponseInterface } from '../core/interfaces/qtis-req-res.interface';

export class DispatchService {
  async dispatch<Req, Res>(
    body: QtisRequestResponseInterface<Req>,
  ): Promise<AxiosResponse<QtisRequestResponseInterface<Res>>> {
    // TODO Make configurable
    // When on localhost -> should get url http://localhost:4201/api/dispatch
    // When on prod -> https://dev37.qxyz.ru/api/dispatch

    return await axios.post<
      QtisRequestResponseInterface<Res>,
      AxiosResponse<QtisRequestResponseInterface<Res>>,
      QtisRequestResponseInterface<Req>
    >('http://localhost:4201/api/dispatch', body, {
      withCredentials: true,
    });
  }
}
