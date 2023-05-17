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
