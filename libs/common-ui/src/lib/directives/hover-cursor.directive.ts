/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { CursorTypes } from '@eustrosoft-front/core';

@Directive({
  selector: '[eustrosoftFrontHoverCursor]',
})
export class HoverCursorDirective {
  @Input() cursorType: CursorTypes = CursorTypes.POINTER;
  @HostBinding('style.cursor') cursor = this.cursorType;

  @HostListener('mouseenter') onMouseEnter(): void {
    this.cursor = this.cursorType;
  }

  @HostListener('mouseleave') onMouseLeave(): void {
    this.cursor = CursorTypes.DEFAULT;
  }
}
