/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
} from '@angular/core';

@Directive({
  selector: '[eustrosoftFrontHover]',
})
export class HoverDirective {
  constructor(private elementRef: ElementRef) {}

  @Input() hoverClasses = ['shadow-lg', 'p-3', 'bg-body', 'rounded'];
  private classes = this.elementRef.nativeElement.classList as DOMTokenList;

  @HostBinding('style.cursor') cursor = 'pointer';

  @HostListener('mouseenter') onMouseEnter() {
    this.applyHover();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.removeHover();
  }

  private applyHover(): void {
    this.classes.add(...this.hoverClasses);
  }

  private removeHover(): void {
    this.classes.remove(...this.hoverClasses);
  }
}
