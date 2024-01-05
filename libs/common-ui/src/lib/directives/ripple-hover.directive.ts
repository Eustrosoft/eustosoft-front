/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Directive, ElementRef, HostListener } from '@angular/core';
import { MatRipple, RippleRef } from '@angular/material/core';

@Directive({
  selector: '[eustrosoftFrontRippleHover]',
})
export class RippleHoverDirective {
  private rippleRef!: RippleRef;

  @HostListener('mouseenter') onMouseEnter(): void {
    this.rippleRef = this.ripple.launch({ persistent: true });
  }

  @HostListener('mouseleave') onMouseLeave(): void {
    this.rippleRef.fadeOut();
  }

  constructor(
    private elementRef: ElementRef,
    private ripple: MatRipple,
  ) {}
}
