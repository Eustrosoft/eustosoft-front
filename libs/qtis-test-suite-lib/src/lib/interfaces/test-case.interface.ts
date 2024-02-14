import { Observable, Subject } from 'rxjs';
import { QtisRequestResponse } from '@eustrosoft-front/dao-ts';

export enum TestResult {
  OK = 'OK',
  FAIL = 'FAIL',
  CANCELED = 'CANCELED',
}

export type ResponseObs<T> = {
  isLoading: boolean;
  isError: boolean;
  isCanceled: boolean;
  response: QtisRequestResponse<T> | undefined;
  testResult: TestResult | undefined;
};

export interface ApiTestCase<T> {
  title: string;
  description: string;
  abort: () => void;
  response$: Observable<ResponseObs<T>>;
  start: Subject<void>;
}
