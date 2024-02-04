/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { QtisRequestResponseInterface } from '../../lib/core/interfaces/qtis-req-res.interface';
import axios, { AxiosResponse } from 'axios';
import { Agent } from 'https';

export class DispatchServiceStub {
  async dispatch<Req, Res>(
    body: QtisRequestResponseInterface<Req>,
  ): Promise<AxiosResponse<QtisRequestResponseInterface<Res>>> {
    return await axios.post<
      QtisRequestResponseInterface<Res>,
      AxiosResponse<QtisRequestResponseInterface<Res>>,
      QtisRequestResponseInterface<Req>
    >('https://dev37.qxyz.ru/api/dispatch', body, {
      withCredentials: true,
      httpsAgent: new Agent({ rejectUnauthorized: false }),
    });
  }
}
