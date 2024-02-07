import { AxiosResponse } from 'axios';
import { QtisRequestResponseInterface } from './qtis-req-res.interface';

export interface RequestFactoryInterface<T> {
  cancelRequest: () => void;
  makeRequest: () => Promise<AxiosResponse<QtisRequestResponseInterface<T>>>;
}
