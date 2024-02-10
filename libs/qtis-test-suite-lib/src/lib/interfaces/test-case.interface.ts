import { Observable, Subject } from 'rxjs';
import { RequestFactory } from '@eustrosoft-front/dao-ts';

export interface ApiTestCase<T> {
  title: string;
  description: string;
  start$: Subject<void>;
  abort$: Subject<void>;
  request$: RequestFactory<T>;
  response$: Observable<T>;
  expectedResponse: T;
  comparator: () => boolean;
  result: string;
}
