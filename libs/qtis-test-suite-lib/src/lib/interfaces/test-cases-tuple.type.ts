/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ApiTestCase } from './test-case.interface';
import {
  AuthLoginLogoutResponse,
  FsUploadHexResponse,
  FsViewResponse,
  PingResponse,
} from '@eustrosoft-front/dao-ts';

export type TestCasesTuple = [
  ApiTestCase<AuthLoginLogoutResponse>,
  ApiTestCase<PingResponse>,
  ApiTestCase<FsViewResponse>,
  ApiTestCase<FsUploadHexResponse>,
];
