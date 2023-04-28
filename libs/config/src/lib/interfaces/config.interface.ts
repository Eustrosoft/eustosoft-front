export interface Config {
  production: boolean;
  apiUrl: string;
  loginUrl: string;
  dispatcherUrl: string;
  explorerUrl: string;
  appsPageUrl: string;
}

export type ConfigKey = keyof Config;
