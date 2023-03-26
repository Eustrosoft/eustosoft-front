import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { CursorTypes } from '@eustrosoft-front/core';

@Directive({
  selector: '[eustrosoftFrontHoverCursor]',
})
export class HoverCursorDirective {
  @Input() cursorType: CursorTypes = CursorTypes.POINTER;
  @HostBinding('style.cursor') cursor = this.cursorType;

  @HostListener('mouseenter') onMouseEnter() {
    this.cursor = this.cursorType;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.cursor = CursorTypes.DEFAULT;
  }
}
