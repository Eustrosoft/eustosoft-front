import { inject, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export const WINDOW: InjectionToken<Window> = new InjectionToken('window', {
  factory: () => inject(DOCUMENT).defaultView,
});
