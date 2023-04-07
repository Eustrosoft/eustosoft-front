import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreateRenameDialogDataInterface } from './create-rename-dialog-data.interface';

@Component({
  selector: 'eustrosoft-front-create-fs-object-dialog',
  templateUrl: './create-rename-folder-dialog.component.html',
  styleUrls: ['./create-rename-folder-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRenameFolderDialogComponent {
  private dialogRef: MatDialogRef<CreateRenameFolderDialogComponent> = inject(
    MatDialogRef<CreateRenameFolderDialogComponent>
  );
  public data: CreateRenameDialogDataInterface = inject(MAT_DIALOG_DATA);
  public cancelButtonText = $localize`Cancel`;

  control = new FormControl(this.data.defaultInputValue, {
    nonNullable: true,
    validators: [Validators.required],
  });

  reject(): void {
    this.dialogRef.close();
  }

  resolve(): void {
    this.dialogRef.close(this.control.value);
  }
}
