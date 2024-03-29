/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { AxiosInterceptorManager, InternalAxiosRequestConfig } from 'axios';

export function httpErrorInterceptor(): string {
  return '';
}

export function withCredentialsInterceptor(): Parameters<
  AxiosInterceptorManager<InternalAxiosRequestConfig>['use']
> {
  const onFulfilled = (config: InternalAxiosRequestConfig) => {
    config.withCredentials = true;
    return config;
  };
  return [onFulfilled, null, undefined];
}

// export function cookiesInterceptor(): Parameters<
//   AxiosInterceptorManager<AxiosResponse>['use']
// > {
//   const onFulfilled = (response: AxiosResponse) => {
//     if (!response.headers['set-cookie']) {
//       return response;
//     }
//     const cookies = response.headers['set-cookie'];
//     axios.defaults.headers.common['Cookie'] = cookies.join('; ');
//     return response;
//   };
//   return [onFulfilled, null, undefined];
// }

export function unauthenticatedInterceptor(): string {
  return '';
}
