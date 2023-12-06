/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { Option } from './option.interface';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'eustrosoft-front-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() fieldAppearance: MatFormFieldAppearance = 'fill';
  @Input() options: Option[] = [];
  @Input() color: ThemePalette = undefined;
  @Input() showEmptyOption = true;
  @Input() hideSubscriptWrapper = false;
  @Input() control!: FormControl;
}
