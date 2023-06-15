/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';

@Component({
  selector: 'eustrosoft-front-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() fieldAppearance: MatFormFieldAppearance = 'fill';
  @Input() cols = 5;
  @Input() rows = 5;
  @Input() control!: FormControl;
  @Input() disabled = false;
}
