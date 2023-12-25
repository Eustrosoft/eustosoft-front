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
  inject,
  Input,
} from '@angular/core';

@Directive({
  selector: '[eustrosoftFrontHoverShadow]',
})
export class HoverShadowDirective {
  private readonly elementRef = inject(ElementRef);
  private readonly classes = this.elementRef.nativeElement
    .classList as DOMTokenList;

  @Input() shadowClasses = ['mat-elevation-z7'];

  @HostBinding('style.cursor') cursor = 'pointer';

  @HostListener('mouseenter') onMouseEnter() {
    this.addShadow();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.removeShadow();
  }

  private addShadow(): void {
    this.classes.add(...this.shadowClasses);
  }

  private removeShadow(): void {
    this.classes.remove(...this.shadowClasses);
  }
}
