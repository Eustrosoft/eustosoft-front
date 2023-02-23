import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'eustrosoft-front-create-fs-object-dialog',
  templateUrl: './create-folder-dialog.component.html',
  styleUrls: ['./create-folder-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateFolderDialogComponent {
  private dialogRef: MatDialogRef<CreateFolderDialogComponent> = inject(
    MatDialogRef<CreateFolderDialogComponent>
  );

  control = new FormControl('Untitled folder', {
    nonNullable: true,
    validators: [Validators.required],
  });

  close(): void {
    this.dialogRef.close();
  }
}
