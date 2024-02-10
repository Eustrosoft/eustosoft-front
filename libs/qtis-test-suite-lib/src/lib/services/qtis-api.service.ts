import { inject, Injectable } from '@angular/core';
import { DAO_QSYS } from '../di/dao.token';
import { Observable, Subject } from 'rxjs';
import { TestCasesTuple } from '../interfaces/test-cases-tuple.type';
import {
  AuthLoginLogoutResponse,
  SubsystemsEnum,
  SupportedLanguagesEnum,
} from '@eustrosoft-front/dao-ts';

@Injectable({
  providedIn: 'root',
})
export class QtisApiService {
  private readonly qSys = inject(DAO_QSYS);

  apiTests: TestCasesTuple = [
    {
      title: 'Login',
      description: 'Login with correct data',
      start$: new Subject<void>(),
      abort$: new Subject<void>(),
      request$: this.qSys.login('', ''),
      // response = behaivorSubject, response$ - observable - async в шаблоне
      response$: new Observable<AuthLoginLogoutResponse>(),
      expectedResponse: {
        s: SubsystemsEnum.LOGIN,
        e: 0,
        m: 'Login success!',
        l: SupportedLanguagesEnum.EN_US,
      },
      comparator: function (): boolean {
        console.log(this.expectedResponse);
        return true;
      },
      result: 'success',
    },
  ];
}
