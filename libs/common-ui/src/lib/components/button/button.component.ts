import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
  @Input() buttonStyleType?:
    | 'raised'
    | 'stroked'
    | 'flat'
    | 'icon'
    | 'fab'
    | 'mini-fab';
  @Input() buttonText = '';
  @Input() disabled = false;
  @Input() iconName = '';
}
