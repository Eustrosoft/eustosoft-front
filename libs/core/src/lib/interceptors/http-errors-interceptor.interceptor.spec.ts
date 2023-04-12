import { TestBed } from '@angular/core/testing';

import { HttpErrorsInterceptorInterceptor } from './http-errors-interceptor.interceptor';

describe('HttpErrorsInterceptorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      HttpErrorsInterceptorInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: HttpErrorsInterceptorInterceptor = TestBed.inject(HttpErrorsInterceptorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
