/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { withCredentialsInterceptor } from '../interceptors/interceptors';
import axios from 'axios';

export class DaoConfig {
  private static instance: DaoConfig | undefined = undefined;
  private _apiUrl: string = '';

  private constructor() {
    this.setupDefaultInterceptors();
  }

  static getInstance(): DaoConfig {
    if (!DaoConfig.instance) {
      DaoConfig.instance = new DaoConfig();
    }
    return DaoConfig.instance;
  }

  get apiUrl(): string {
    return this._apiUrl;
  }

  set apiUrl(apiBaseUrl: string) {
    this._apiUrl = apiBaseUrl;
  }

  private setupDefaultInterceptors(): void {
    axios.interceptors.request.use(...withCredentialsInterceptor());
  }
}
