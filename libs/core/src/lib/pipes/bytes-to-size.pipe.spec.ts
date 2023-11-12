/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { BytesToSizePipe } from './bytes-to-size.pipe';

describe('BytesToSizePipe', () => {
  it('create an instance', () => {
    const pipe = new BytesToSizePipe();
    expect(pipe).toBeTruthy();
  });
});
