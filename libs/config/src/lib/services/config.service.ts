import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Config } from '../interfaces/config.interface';
import { APP_BASE_HREF } from '@angular/common';

@Injectable()
export class ConfigService {
  private http: HttpClient = inject(HttpClient);
  private appBaseHref = inject(APP_BASE_HREF);
  private configUrl = `${window.location.origin}${this.appBaseHref}config.json`;

  getConfig(): Observable<Config> {
    return this.http.get<Config>(this.configUrl).pipe(shareReplay(1));
  }
}
