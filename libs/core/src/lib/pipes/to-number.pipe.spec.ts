/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ToNumberPipe } from './to-number.pipe';

describe('ToNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new ToNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
