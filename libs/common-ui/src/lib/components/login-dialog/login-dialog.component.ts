/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoginDialogDataInterface } from './login-dialog-data.interface';

@Component({
  selector: 'eustrosoft-front-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginDialogComponent {
  data: LoginDialogDataInterface = inject(MAT_DIALOG_DATA);
}
