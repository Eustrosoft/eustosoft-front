/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FormArrayPipe } from './form-array.pipe';

describe('FormArrayPipe', () => {
  it('create an instance', () => {
    const pipe = new FormArrayPipe();
    expect(pipe).toBeTruthy();
  });
});
