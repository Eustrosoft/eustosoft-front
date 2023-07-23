/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { HoverDirective } from './hover.directive';
import { ElementRef } from '@angular/core';

describe('HoverShadowDirective', () => {
  it('should create an instance', () => {
    const directive = new HoverDirective({} as ElementRef);
    expect(directive).toBeTruthy();
  });
});
