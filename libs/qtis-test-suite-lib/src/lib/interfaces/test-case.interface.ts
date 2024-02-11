import { Observable, Subject } from 'rxjs';
import { QtisRequestResponse, RequestFactory } from '@eustrosoft-front/dao-ts';

export enum CompareResult {
  OK = 'OK',
  FAIL = 'FAIL',
}

export type ResponseObs<T> = {
  isLoading: boolean;
  isError: boolean;
  response: QtisRequestResponse<T> | undefined;
  compareResult: CompareResult | undefined;
};

export interface ApiTestCase<T> {
  title: string;
  description: string;
  abort: () => void;
  requestFactory: RequestFactory<T>;
  response$: Observable<ResponseObs<T>>;
  start: Subject<void>;
}
