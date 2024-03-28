/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { QSystem } from '../lib/qsys/QSystem';
import { env } from 'process';
import { DaoConfig } from '../lib/core/config/DaoConfig';
import { isNullOrUndefinedOrEmpty } from '../lib/utils/is-empty.function';
import { DispatchService } from '../lib/services/DispatchService';
import { Agent } from 'https';

describe('Auth module', () => {
  if (
    isNullOrUndefinedOrEmpty(env.AUTH_LOGIN) ||
    isNullOrUndefinedOrEmpty(env.AUTH_PASSWORD) ||
    isNullOrUndefinedOrEmpty(env.AUTH_FULLNAME) ||
    isNullOrUndefinedOrEmpty(env.API_URL)
  ) {
    throw new Error(
      'One or more required environment variables are missing: AUTH_LOGIN, AUTH_PASSWORD, AUTH_FULLNAME, API_URL. ' +
        'Configure .env.test file in the lib root folder using .env.example file.',
    );
  }
  DaoConfig.getInstance().apiUrl = env.API_URL!;
  const login = env.AUTH_LOGIN!;
  const password = env.AUTH_PASSWORD!;
  const fullName = env.AUTH_FULLNAME!;
  const dispatchService = DispatchService.getInstance();
  const qSys = new QSystem(dispatchService);
  const axiosInstance = dispatchService.getAxiosInstance();
  axiosInstance.defaults.httpsAgent = new Agent({ rejectUnauthorized: false });

  test('login request successful', async () => {
    const request = qSys.login(login, password);
    const response = await request.makeRequest();
    const data = response.data;
    expect(data.r[0].m).toBe('Login success!');
    expect(data.r[0].e).toBe(0);
  });

  test('login request unsuccessful', async () => {
    const request = qSys.login('123', '');
    const response = await request.makeRequest();
    const data = response.data;
    expect(data.r[0].m).toBe(
      'FATAL: password authentication failed for user "123"',
    );
    expect(data.r[0].e).toBe(500);
  });

  test('ping request', async () => {
    const request = qSys.ping();
    const response = await request.makeRequest();
    const data = response.data;
    expect(data.r[0].m).toBe('Ok');
    expect(data.r[0].fullName).toBe(fullName);
  });
});
