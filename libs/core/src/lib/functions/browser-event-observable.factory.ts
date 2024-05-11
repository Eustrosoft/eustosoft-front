import { inject } from '@angular/core';
import { fromEvent, Observable, of } from 'rxjs';
import { WINDOW } from '../di/window.token';
import { IS_BROWSER } from '../di/is-browser.token';

export const browserEventObservableFactory = <T>(
  eventName: string,
): Observable<T> => {
  const window: Window = inject(WINDOW);
  const isBrowser: boolean = inject(IS_BROWSER);

  return isBrowser ? fromEvent<T>(window, eventName) : of();
};
