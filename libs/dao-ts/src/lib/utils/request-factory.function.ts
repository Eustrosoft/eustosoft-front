/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { DispatchService } from '../services/DispatchService';
import { QtisRequestResponse } from '../core/interfaces/qtis-req-res.interface';
import { RequestFactory } from '../core/interfaces/request-factory.interface';

export function requestFactoryFunction<Req, Res>(
  body: QtisRequestResponse<Req>,
): RequestFactory<Res> {
  const controller = new AbortController();
  const { signal } = controller;
  const dispatchService = DispatchService.getInstance();

  const cancelRequest = () => {
    controller.abort();
  };

  const makeRequest = async () =>
    dispatchService.dispatch<Req, Res>(body, signal);

  return { cancelRequest, makeRequest };
}
