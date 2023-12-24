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
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[eustrosoftFrontHoverShadow]',
})
export class HoverShadowDirective {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  @HostBinding('style.cursor') cursor = 'pointer';

  @HostListener('mouseenter') onMouseEnter() {
    this.addShadow();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.removeShadow();
  }

  private addShadow(): void {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'box-shadow',
      '0 0 0.5rem 0 rgba(0, 0, 0, 0.25)'
    );
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'transition',
      'box-shadow 0.2s ease-in-out'
    );
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'border-radius',
      '0.5rem'
    );
  }

  private removeShadow(): void {
    this.renderer.removeStyle(this.elementRef.nativeElement, 'box-shadow');
    this.renderer.removeStyle(this.elementRef.nativeElement, 'border-radius');
  }
}
