import { AxiosResponse } from 'axios';
import { QtisRequestResponse } from './qtis-req-res.interface';

export interface RequestFactory<T> {
  cancelRequest: () => void;
  makeRequest: () => Promise<AxiosResponse<QtisRequestResponse<T>>>;
}
