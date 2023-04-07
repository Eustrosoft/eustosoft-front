import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PromptDialogDataInterface } from './prompt-dialog-data.interface';

@Component({
  selector: 'eustrosoft-front-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  styleUrls: ['./prompt-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptDialogComponent {
  private dialogRef: MatDialogRef<PromptDialogComponent> = inject(
    MatDialogRef<PromptDialogComponent>
  );
  public data: PromptDialogDataInterface = inject(MAT_DIALOG_DATA);

  reject(): void {
    this.dialogRef.close(false);
  }

  resolve(): void {
    this.dialogRef.close(true);
  }
}
