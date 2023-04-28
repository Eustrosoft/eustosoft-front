import { Config } from '../interfaces/config.interface';
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export const APP_CONFIG = new InjectionToken<Observable<Config>>(
  'Application configurations (environment)'
);
