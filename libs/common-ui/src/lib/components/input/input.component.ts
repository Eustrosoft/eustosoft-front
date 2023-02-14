import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { InputTypes } from '@eustrosoft-front/core';

@Component({
  selector: 'eustrosoft-front-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() fieldAppearance: MatFormFieldAppearance = 'fill';
  @Input() control!: FormControl;
  @Input() inputType: InputTypes = InputTypes.TEXT;
  @Input() suffixIcon = '';
  @Input() disabled = false;

  InputTypes = InputTypes;
}
