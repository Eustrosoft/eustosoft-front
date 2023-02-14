import { InjectionToken } from '@angular/core';
import { Environment } from './environment.interface';

export const APP_ENVIRONMENT = new InjectionToken<Environment>(
  'Application environment'
);
export { Environment } from './environment.interface';
