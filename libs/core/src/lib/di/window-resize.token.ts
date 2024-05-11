import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { browserEventObservableFactory } from '../functions/browser-event-observable.factory';

export const WINDOW_RESIZE_EVENT$: InjectionToken<Observable<Event>> =
  new InjectionToken('window resize event observable', {
    factory: () => browserEventObservableFactory<Event>('resize'),
  });
