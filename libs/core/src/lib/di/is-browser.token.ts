import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const IS_BROWSER: InjectionToken<boolean> = new InjectionToken('is browser', {
  factory: () => isPlatformBrowser(inject(PLATFORM_ID)),
});
