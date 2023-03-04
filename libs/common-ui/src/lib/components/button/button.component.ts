import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'eustrosoft-front-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() color: ThemePalette = undefined;
  @Input() buttonType: 'button' | 'submit' = 'button';
  @Input() buttonStyleType:
    | 'raised'
    | 'stroked'
    | 'flat'
    | 'icon'
    | 'fab'
    | 'mini-fab' = 'flat';
  @Input() buttonText = '';
  @Input() disabled = false;
  @Input() iconName = '';

  @Output() clicked = new EventEmitter<MouseEvent>();
}
