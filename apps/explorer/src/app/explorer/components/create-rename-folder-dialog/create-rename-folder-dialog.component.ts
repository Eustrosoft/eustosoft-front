import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreateRenameDialogData } from '../../interfaces/create-rename-dialog-data.interface';

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
  public data: CreateRenameDialogData = inject(MAT_DIALOG_DATA);

  control = new FormControl(this.data.defaultInputValue, {
    nonNullable: true,
    validators: [Validators.required],
  });

  close(): void {
    this.dialogRef.close();
  }
}
