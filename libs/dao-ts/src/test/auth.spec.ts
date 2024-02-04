/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { QSystem } from '../lib/qsys/QSystem';
import { DispatchServiceStub } from './stubs/DispatchService.stub';
import { env } from 'process';

describe('Auth module', () => {
  const DispatcherServiceStub = new DispatchServiceStub();
  const qSys = new QSystem(DispatcherServiceStub);
  const login = env.AUTH_LOGIN;
  const password = env.AUTH_PASSWORD;
  const fullName = env.AUTH_FULLNAME;
  if (
    login === null ||
    login === undefined ||
    password === null ||
    password === undefined ||
    fullName === null ||
    fullName === undefined
  ) {
    throw new Error(
      'env.AUTH_LOGIN or env.AUTH_PASSWORD is missing. Configure .env.test file in lib root folder',
    );
  }

  test('login request successful', async () => {
    const response = await qSys.login(login, password);
    const data = response.data;
    expect(data.r[0].m).toBe('Login success!');
    expect(data.r[0].e).toBe(0);
  });

  test('login request unsuccessful', async () => {
    const response = await qSys.login('123', '');
    const data = response.data;
    expect(data.r[0].m).toBe(
      'FATAL: password authentication failed for user "123"',
    );
    expect(data.r[0].e).toBe(500);
  });

  test('ping request', async () => {
    await qSys.login(login, password);
    const response = await qSys.ping();
    const data = response.data;
    expect(data.r[0].m).toBe('Ok');
    expect(data.r[0].fullName).toBe(fullName);
  });
});
