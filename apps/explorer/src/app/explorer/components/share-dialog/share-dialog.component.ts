import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { ShareDialogDataInterface } from './share-dialog-data.interface';

@Component({
  selector: 'eustrosoft-front-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareDialogComponent {
  private dialogRef = inject<MatDialogRef<ShareDialogComponent, string>>(
    MatDialogRef<ShareDialogComponent>
  );
  public data: ShareDialogDataInterface = inject(MAT_DIALOG_DATA);

  control = new FormControl('', {
    nonNullable: true,
  });

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown(e: KeyboardEvent) {
    e.stopPropagation();
    this.dialogRef.close(this.control.value);
  }

  reject(): void {
    this.dialogRef.close();
  }

  resolve(): void {
    this.dialogRef.close(this.control.value);
  }
}
